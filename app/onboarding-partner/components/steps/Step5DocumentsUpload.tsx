"use client";

import { useState, useMemo, useEffect } from "react";
import { useOnboardingPartner } from "../../context/OnboardingContext";
import { useDocumentTypes } from "@/app/hooks/use-document-types";
import {
  useCompleteDocuments,
  useUploadShareholderDocument,
  useLookupCompany,
  useVerifyBeneficialOwner,
} from "@/app/hooks/use-onboarding";
import {
  MdOutlineCloudUpload,
  MdCheckCircle,
  MdErrorOutline,
  MdOutlinePerson,
  MdOutlineBusiness,
  MdOutlineAccessTime,
  MdOutlineVisibility,
  MdOpenInNew,
  MdRefresh,
  MdContentCopy,
  MdOutlineDownload,
  MdOutlineLink,
} from "react-icons/md";
import { uploadRespondentDocument } from "@/app/utils/api/respondents";
import { useToast } from "@/app/hooks/use-toast";
import { ToastContainer } from "@/app/components/disbursement/container";

type Tab = "Pending Actions" | "In Review" | "Completed";

interface BeneficialOwnerDocInfo {
  id?: string;
  shareholderId?: string;
  firstName?: string;
  lastName?: string;
  proofOfWealthUrl?: string;
  proofOfAddressUrl?: string;
  verificationUrl?: string;
  verificationLink?: string;
  url?: string;
  verificationStatus?: string;
}

// AML Due Diligence is a special hardcoded company doc with a downloadable PDF
const AML_DOC_ID = "__aml_due_diligence__";
const AML_PDF_PATH = "/DUE_DILIGENCE_FORM.pdf";

export default function Step5DocumentsUpload() {
  const {
    markStepCompleted,
    goToNextStep,
    goToPrevStep,
    companyId,
    registrationData,
    setRegistrationData,
  } = useOnboardingPartner();
  const { data: documentTypes, isLoading } = useDocumentTypes();
  const completeDocs = useCompleteDocuments();
  const uploadShareholderDoc = useUploadShareholderDocument();
  const lookupCompany = useLookupCompany();
  const verifyBeneficialOwner = useVerifyBeneficialOwner();
  const { info, error: showError, success, toasts, dismiss } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>("Pending Actions");
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  // per-owner: "generating" | "refreshing" | null
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [generatedVerificationLinks, setGeneratedVerificationLinks] = useState<
    Record<string, string>
  >({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const mergeVerificationLink = (
    data: typeof registrationData,
    shareholderId: string,
    url: string,
    status?: string,
  ) => {
    if (!data?.beneficialOwners) return data;
    return {
      ...data,
      beneficialOwners: data.beneficialOwners.map((owner) => {
        const ownerId =
          (owner as BeneficialOwnerDocInfo).id ||
          (owner as BeneficialOwnerDocInfo).shareholderId;
        if (ownerId !== shareholderId) return owner;
        return {
          ...owner,
          verificationUrl: url,
          verificationLink: url,
          url,
          verificationStatus:
            status || (owner as BeneficialOwnerDocInfo).verificationStatus,
        };
      }),
    };
  };

  // Refresh registration data on mount so beneficial owner docs are current
  useEffect(() => {
    if (!registrationData?.rcNumber) return;
    queueMicrotask(() => {
      setIsRefreshing(true);
    });
    lookupCompany
      .mutateAsync(registrationData.rcNumber)
      .then((res) => {
        if (res.success && res.data) {
          setRegistrationData(res.data);
        }
      })
      .catch(() => {
        /* silently fail */
      })
      .finally(() => setIsRefreshing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const handleFileChange = (docTypeId: string, file: File | null) => {
    if (file) {
      setSelectedFiles((prev) => ({ ...prev, [docTypeId]: file }));
    } else {
      setSelectedFiles((prev) => {
        const next = { ...prev };
        delete next[docTypeId];
        return next;
      });
    }
  };

  const handleShareholderDocUpload = async (
    shareholderId: string,
    docType: string,
    file: File | null,
  ) => {
    if (!file) return;
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("shareholderId", shareholderId);

      let fieldName = "file";
      if (docType.toLowerCase().includes("wealth")) {
        fieldName = "proofOfWealth";
      } else if (docType.toLowerCase().includes("address")) {
        fieldName = "proofOfAddress";
      }

      uploadFormData.append(fieldName, file);

      info("Uploading", `Uploading ${docType}...`);
      const updatedData =
        await uploadShareholderDoc.mutateAsync(uploadFormData);

      if (updatedData) {
        setRegistrationData(updatedData);
      }

      success("Success", `${docType} uploaded successfully.`);
    } catch (err: unknown) {
      showError(
        "Error",
        err instanceof Error ? err.message : "Failed to upload document",
      );
    }
  };

  /** Generate (or refresh) a verification link for a beneficial owner */
  const handleGenerateVerificationLink = async (shareholderId: string) => {
    try {
      setVerifyingId(shareholderId);
      const verifyRes = await verifyBeneficialOwner.mutateAsync(shareholderId);

      if (verifyRes?.url) {
        setRegistrationData((prev) =>
          mergeVerificationLink(
            prev,
            shareholderId,
            verifyRes.url,
            verifyRes.verificationStatus,
          ),
        );
        setGeneratedVerificationLinks((prev) => ({
          ...prev,
          [shareholderId]: verifyRes.url,
        }));
      }
      success("Done", "Verification link generated.");
    } catch (err: unknown) {
      showError(
        "Error",
        err instanceof Error
          ? err.message
          : "Failed to generate verification link.",
      );
    } finally {
      setVerifyingId(null);
    }
  };

  const allShareholderDocs = useMemo(() => {
    const docs: Array<{
      shareholderId: string;
      name: string;
      docType: string;
      url?: string;
      isVerificationLink?: boolean;
      verificationUrl?: string;
      verificationStatus?: string;
    }> = [];
    if (!registrationData?.beneficialOwners) return docs;

    registrationData.beneficialOwners.forEach((_owner: unknown) => {
      const owner = _owner as BeneficialOwnerDocInfo;
      const ownerId = owner.id || owner.shareholderId;
      if (!ownerId) return;

      const generatedLink = generatedVerificationLinks[ownerId as string];
      const verUrl =
        generatedLink ||
        owner.verificationUrl ||
        owner.verificationLink ||
        owner.url;

      // Identity Verification row — shows link actions, not an upload
      docs.push({
        shareholderId: ownerId as string,
        name: `${owner.firstName} ${owner.lastName}`,
        docType: "Identity Verification",
        isVerificationLink: true,
        verificationUrl: verUrl,
        verificationStatus: owner.verificationStatus,
        url: verUrl, // treated as "done" if a link exists
      });

      // Proof of Wealth
      docs.push({
        shareholderId: ownerId as string,
        name: `${owner.firstName} ${owner.lastName}`,
        docType: "Proof of Wealth",
        url: owner.proofOfWealthUrl as string | undefined,
      });

      // Proof of Address
      docs.push({
        shareholderId: ownerId as string,
        name: `${owner.firstName} ${owner.lastName}`,
        docType: "Proof of Address",
        url: owner.proofOfAddressUrl as string | undefined,
      });
    });
    return docs;
  }, [registrationData, generatedVerificationLinks]);

  const groupedAllShareholders = useMemo(() => {
    const map = new Map<
      string,
      { shareholderId: string; name: string; docs: typeof allShareholderDocs }
    >();
    allShareholderDocs.forEach((doc) => {
      if (!map.has(doc.shareholderId)) {
        map.set(doc.shareholderId, {
          shareholderId: doc.shareholderId,
          name: doc.name,
          docs: [],
        });
      }
      map.get(doc.shareholderId)!.docs.push(doc);
    });
    return Array.from(map.values());
  }, [allShareholderDocs]);

  const handleNext = async () => {
    if (!companyId) {
      setError("Company ID is missing. Please start again.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      // AML doc is required — check it's in selectedFiles
      const amlFile = selectedFiles[AML_DOC_ID];
      if (!amlFile) {
        throw new Error(
          "Please fill, sign and upload the AML Due Diligence Questionnaire.",
        );
      }

      const requiredTypes = documentTypes?.filter((t) => t.required) || [];
      const missingRequired = requiredTypes.filter((t) => !selectedFiles[t.id]);
      const missingShareholderDocs = allShareholderDocs.filter(
        (doc) => !doc.isVerificationLink && !doc.url,
      );

      if (missingRequired.length > 0 || missingShareholderDocs.length > 0) {
        throw new Error(
          "Please complete all pending actions before proceeding.",
        );
      }

      // Upload AML doc first (as a company document)
      const amlFormData = new FormData();
      amlFormData.append("companyId", companyId);
      amlFormData.append("documents[0].file", amlFile);
      amlFormData.append("documents[0].title", amlFile.name);
      amlFormData.append("documents[0].documentType", "AML_DUE_DILIGENCE");
      amlFormData.append(
        "documents[0].description",
        "AML Due Diligence Questionnaire",
      );

      const uploadPromises = [
        uploadRespondentDocument(amlFormData),
        ...Object.entries(selectedFiles)
          .filter(([id]) => id !== AML_DOC_ID)
          .map(([docTypeId, file]) => {
            const docType = documentTypes?.find((t) => t.id === docTypeId);
            const formData = new FormData();
            formData.append("companyId", companyId);
            formData.append("documents[0].file", file);
            formData.append("documents[0].title", file.name);
            formData.append("documents[0].documentType", docTypeId);
            formData.append(
              "documents[0].description",
              docType?.description || docType?.name || `${docTypeId} upload`,
            );
            return uploadRespondentDocument(formData);
          }),
      ];

      await Promise.all(uploadPromises);

      const response = await completeDocs.mutateAsync(companyId);
      if (response) {
        setRegistrationData(response);
      }

      markStepCompleted(5);
      goToNextStep();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload documents. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isRefreshing) {
    return (
      <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex-1 flex items-center justify-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-[#185A9D] border-t-transparent animate-spin" />
          <p className="text-slate-500 dark:text-slate-400">
            {isRefreshing
              ? "Refreshing your documents..."
              : "Loading document requirements..."}
          </p>
        </div>
      </div>
    );
  }

  const companyDocsAll = documentTypes || [];

  // AML doc counts as 1 pending if not yet selected
  const amlPending = !selectedFiles[AML_DOC_ID] ? 1 : 0;
  const companyDocsPendingCount =
    amlPending + companyDocsAll.filter((doc) => !selectedFiles[doc.id]).length;
  const shareholderDocsPendingCount = allShareholderDocs.filter(
    (doc) => !doc.isVerificationLink && !doc.url,
  ).length;

  const pendingCount = companyDocsPendingCount + shareholderDocsPendingCount;
  const inReviewCount = 0;

  const companyInitials = registrationData?.legalBusinessName ?? "Company";

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mt-6">
      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-100 dark:border-slate-700 mb-8 pb-3">
        {(["Pending Actions", "In Review"] as Tab[]).map((tab) => {
          const isActive = activeTab === tab;
          let count = 0;
          let Icon = MdOutlineAccessTime;

          if (tab === "Pending Actions") {
            count = pendingCount;
            Icon = MdOutlineAccessTime;
          } else if (tab === "In Review") {
            count = inReviewCount;
            Icon = MdOutlineVisibility;
          }

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 text-[15px] font-bold transition-all relative ${
                isActive
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {tab === "Pending Actions" ? "Documents" : tab}
              {tab === "Pending Actions" && count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isActive ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"}`}
                >
                  {count}
                </span>
              )}
              {tab === "Pending Actions" && count === 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isActive ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"}`}
                >
                  <MdCheckCircle className="w-3.5 h-3.5 inline mr-1" /> All Done
                </span>
              )}
              {tab === "In Review" && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${isActive ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"}`}
                >
                  {count}
                </span>
              )}
              {isActive && (
                <div className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-slate-900 dark:bg-white rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-slate-900 dark:text-white mb-2">
          Upload documents &amp; submit
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-[15px]">
          Please provide the following information and documents. Your progress
          is automatically saved, so you can leave and come back anytime.
        </p>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-2">
          <MdErrorOutline className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex-1 space-y-8">
        {activeTab === "Pending Actions" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Company Documents */}
            <div>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <MdOutlineBusiness className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                  <h3 className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">
                    {companyInitials}
                  </h3>
                </div>
                {companyDocsPendingCount > 0 ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 rounded-md text-[13px] font-medium">
                    <MdErrorOutline className="w-4 h-4" />
                    {companyDocsPendingCount} pending action
                    {companyDocsPendingCount !== 1 ? "s" : ""}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-md text-[11px] font-bold uppercase tracking-wide">
                    <MdCheckCircle className="w-3.5 h-3.5" /> COMPLETED
                  </div>
                )}
              </div>

              {/* ── Dynamic company document types from API ── */}
              {companyDocsAll.map((docType) => {
                const file = selectedFiles[docType.id];
                const isUploaded = !!file;
                return (
                  <div
                    key={docType.id}
                    className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <h4 className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">
                        {docType.name}{" "}
                        {!isUploaded && docType.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </h4>
                      {!isUploaded ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-1">
                          {docType.description ||
                            `Please provide the ${docType.name.toLowerCase()} of your company.`}
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-1">
                          <MdCheckCircle className="text-emerald-500 w-4 h-4" />{" "}
                          {file.name}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {isUploaded && (
                        <button
                          onClick={() => {
                            const objectUrl = URL.createObjectURL(file);
                            setPreviewUrl(objectUrl);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          title="Preview document"
                        >
                          <MdOutlineVisibility className="w-4 h-4" />
                          View
                        </button>
                      )}
                      <input
                        type="file"
                        id={`doc-${docType.id}`}
                        className="hidden"
                        onChange={(e) =>
                          handleFileChange(
                            docType.id,
                            e.target.files?.[0] || null,
                          )
                        }
                      />
                      <label
                        htmlFor={`doc-${docType.id}`}
                        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[14px] font-semibold rounded-lg cursor-pointer transition-colors ${
                          !isUploaded
                            ? "bg-[#185A9D] text-white hover:bg-[#124b86]"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        {!isUploaded ? (
                          <>
                            <MdOutlineCloudUpload className="w-[18px] h-[18px]" />{" "}
                            Upload
                          </>
                        ) : (
                          "Change File"
                        )}
                      </label>
                    </div>
                  </div>
                );
              })}

              {/* ── AML Due Diligence Questionnaire (hardcoded, required) ── */}
              {(() => {
                const amlFile = selectedFiles[AML_DOC_ID];
                const isUploaded = !!amlFile;
                return (
                  <div className="py-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">
                        AML Due Diligence Questionnaire{" "}
                        {!isUploaded && <span className="text-red-500">*</span>}
                      </h4>
                      {isUploaded ? (
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-1">
                          <MdCheckCircle className="text-emerald-500 w-4 h-4" />
                          {amlFile.name}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Please fill, sign and upload the{" "}
                          <a
                            href={AML_PDF_PATH}
                            download="AML Due Diligence Questionnaire.pdf"
                            className="inline-flex items-center gap-1 text-[#185A9D] hover:underline font-medium"
                          >
                            <MdOutlineDownload className="w-4 h-4" />
                            TradeBlotter AML Due Diligence Questionnaire
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {/* Preview button */}
                      <button
                        onClick={() => {
                          if (isUploaded && amlFile) {
                            const objectUrl = URL.createObjectURL(amlFile);
                            setPreviewUrl(objectUrl);
                          } else {
                            setPreviewUrl(AML_PDF_PATH);
                          }
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        title="Preview document"
                      >
                        <MdOutlineVisibility className="w-4 h-4" />
                        View
                      </button>
                      {/* Always show Download button */}
                      <a
                        href={AML_PDF_PATH}
                        download="AML Due Diligence Questionnaire.pdf"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        title="Download form"
                      >
                        <MdOutlineDownload className="w-4 h-4" />
                        Download
                      </a>
                      {/* Upload / Re-upload */}
                      <input
                        type="file"
                        id={`doc-${AML_DOC_ID}`}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          handleFileChange(
                            AML_DOC_ID,
                            e.target.files?.[0] || null,
                          )
                        }
                      />
                      <label
                        htmlFor={`doc-${AML_DOC_ID}`}
                        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[14px] font-semibold rounded-lg cursor-pointer transition-colors ${
                          !isUploaded
                            ? "bg-[#185A9D] text-white hover:bg-[#124b86]"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                      >
                        {!isUploaded ? (
                          <>
                            <MdOutlineCloudUpload className="w-[18px] h-[18px]" />
                            Upload
                          </>
                        ) : (
                          "Re-upload"
                        )}
                      </label>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Business Owner Cards */}
            {groupedAllShareholders.map((owner) => {
              const pendingDocs = owner.docs.filter(
                (d) => !d.isVerificationLink && !d.url,
              ).length;
              return (
                <div key={owner.shareholderId}>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <MdOutlinePerson className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                      <h3 className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">
                        {owner.name}
                      </h3>
                    </div>
                    {pendingDocs > 0 ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 rounded-md text-[13px] font-medium">
                        <MdErrorOutline className="w-4 h-4" />
                        {pendingDocs} pending action
                        {pendingDocs !== 1 ? "s" : ""}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-md text-[11px] font-bold uppercase tracking-wide">
                        <MdCheckCircle className="w-3.5 h-3.5" /> COMPLETED
                      </div>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {owner.docs.map((doc, idx) => {
                      /* ── Identity Verification row ── */
                      if (doc.isVerificationLink) {
                        const hasLink = !!doc.verificationUrl;
                        const isWorking = verifyingId === doc.shareholderId;
                        return (
                          <div
                            key={`${doc.shareholderId}-verify-${idx}`}
                            className="py-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                          >
                            <div className="flex-1">
                              <h4 className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">
                                Identity Verification
                              </h4>
                              {hasLink ? (
                                <>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                    Share this link with the beneficial owner to
                                    complete their identity verification.
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-600 dark:text-slate-300 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                                      {doc.verificationUrl}
                                    </div>
                                    <button
                                      onClick={() =>
                                        navigator.clipboard.writeText(
                                          doc.verificationUrl || "",
                                        )
                                      }
                                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#185A9D] hover:bg-[#185A9D]/10 rounded-md transition-colors"
                                      title="Copy link"
                                    >
                                      <MdContentCopy className="w-4 h-4" />
                                    </button>
                                    {/* Refresh link */}
                                    <button
                                      onClick={() =>
                                        handleGenerateVerificationLink(
                                          doc.shareholderId,
                                        )
                                      }
                                      disabled={isWorking}
                                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#185A9D] hover:bg-[#185A9D]/10 rounded-md transition-colors disabled:opacity-50"
                                      title="Regenerate link"
                                    >
                                      <MdRefresh
                                        className={`w-4 h-4 ${isWorking ? "animate-spin" : ""}`}
                                      />
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-1">
                                  No verification link yet. Click{" "}
                                  <strong>Generate Link</strong> to create one.
                                </p>
                              )}
                            </div>
                            <div className="shrink-0 flex flex-col gap-2 items-end">
                              {!hasLink && (
                                <button
                                  onClick={() =>
                                    handleGenerateVerificationLink(
                                      doc.shareholderId,
                                    )
                                  }
                                  disabled={isWorking}
                                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[14px] font-semibold rounded-lg bg-[#185A9D] text-white hover:bg-[#124b86] transition-colors disabled:opacity-60"
                                >
                                  {isWorking ? (
                                    <>
                                      <MdRefresh className="w-[18px] h-[18px] animate-spin" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <MdOutlineLink className="w-[18px] h-[18px]" />
                                      Generate Link
                                    </>
                                  )}
                                </button>
                              )}
                              {/* Open link in new tab (when exists) */}
                              {hasLink && (
                                <a
                                  href={doc.verificationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[14px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                  <MdOpenInNew className="w-[18px] h-[18px]" />
                                  Verify Now
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      }

                      /* ── Upload row (Proof of Wealth / Proof of Address) ── */
                      const isUploaded = !!doc.url;
                      return (
                        <div
                          key={`${doc.shareholderId}-${doc.docType}-${idx}`}
                          className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex-1">
                            <h4 className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">
                              {doc.docType}{" "}
                              {!isUploaded && (
                                <span className="text-red-500">*</span>
                              )}
                            </h4>
                            {!isUploaded ? (
                              <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-1">
                                Please provide the {doc.docType.toLowerCase()}{" "}
                                for this business owner.
                              </p>
                            ) : (
                              <div className="flex items-center gap-3 mt-1 text-sm">
                                <span className="font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                  <MdCheckCircle className="text-emerald-500 w-4 h-4" />{" "}
                                  Uploaded
                                </span>
                                {doc.url && (
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#185A9D] hover:underline font-medium"
                                  >
                                    View Document
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="shrink-0">
                            <input
                              type="file"
                              id={`sh-doc-${doc.shareholderId}-${doc.docType}`}
                              className="hidden"
                              onChange={(e) =>
                                handleShareholderDocUpload(
                                  doc.shareholderId,
                                  doc.docType,
                                  e.target.files?.[0] || null,
                                )
                              }
                            />
                            <label
                              htmlFor={`sh-doc-${doc.shareholderId}-${doc.docType}`}
                              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[14px] font-semibold rounded-lg cursor-pointer transition-colors ${
                                !isUploaded
                                  ? "bg-[#185A9D] text-white hover:bg-[#124b86]"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                              }`}
                            >
                              {!isUploaded ? (
                                <>
                                  <MdOutlineCloudUpload className="w-[18px] h-[18px]" />{" "}
                                  Upload
                                </>
                              ) : (
                                "Change File"
                              )}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {groupedAllShareholders.length === 0 &&
              companyDocsAll.length === 0 &&
              !amlPending && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400">
                  No documents found.
                </div>
              )}
          </div>
        )}

        {activeTab === "In Review" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400">
              No documents currently in review.
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 mb-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-between">
        <button
          onClick={goToPrevStep}
          disabled={isSubmitting}
          className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={isSubmitting || pendingCount > 0}
          className="px-8 py-3 bg-[#185A9D] hover:bg-[#124b86] text-white font-bold rounded-xl shadow-md shadow-[#185A9D]/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? "Uploading..." : "Submit"}
        </button>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Document Preview
              </h3>
              <button
                onClick={() => setPreviewUrl(null)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 p-4">
              <object
                data={previewUrl}
                className="w-full h-full rounded-lg border-none"
                title="Document Preview"
              >
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <p className="mb-4">Unable to display preview.</p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#185A9D] text-white rounded-lg hover:bg-[#124b86] transition-colors"
                  >
                    Open Document
                  </a>
                </div>
              </object>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
