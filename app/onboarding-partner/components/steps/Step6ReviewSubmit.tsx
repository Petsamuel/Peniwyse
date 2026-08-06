"use client";

import { useState, useEffect, useMemo } from "react";
import { useOnboardingPartner } from "../../context/OnboardingContext";
import { useSubmitRegistration, RegistrationInfo } from "@/app/hooks/use-onboarding";
import {
  MdCheckCircle,
  MdErrorOutline,
  MdBusiness,
  MdOutlineContactPhone,
  MdInfoOutline,
  MdOutlinePeople,
  MdOutlineDescription,
  MdOutlineAccountBalance,
  MdEdit,
} from "react-icons/md";
import { normalizeReviewStatus } from "../../utils/document-review";

type Row = Record<string, unknown>;

/** Reads the first non-empty value among aliases — the API is not consistent about names. */
function pick(source: Row | null | undefined, ...keys: string[]) {
  if (!source) return undefined;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && !Number.isNaN(value)) return String(value);
    if (typeof value === "boolean") return value ? "Yes" : "No";
  }
  return undefined;
}

function pickList(source: Row | null | undefined, ...keys: string[]): string[] {
  if (!source) return [];
  for (const key of keys) {
    const value = source[key];
    if (Array.isArray(value) && value.length > 0) {
      return value.map((item) => String(item)).filter(Boolean);
    }
  }
  return [];
}

function formatDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMoney(value?: string) {
  if (!value) return undefined;
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return `$${amount.toLocaleString("en-US")}`;
}

function joinAddress(source: Row | null | undefined, prefix: "" | "operating") {
  const key = (name: string) =>
    prefix ? `${prefix}${name.charAt(0).toUpperCase()}${name.slice(1)}` : name;
  const parts = [
    pick(source, key("streetAddress"), key("address")),
    pick(source, key("city")),
    pick(source, key("state")),
    pick(source, key("postalCode")),
    pick(source, key("country")),
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="text-slate-500 dark:text-slate-400 block text-xs mb-0.5">{label}</span>
      {value ? (
        <span className="font-medium text-slate-800 dark:text-slate-100 break-words">{value}</span>
      ) : (
        <span className="font-medium text-slate-300 dark:text-slate-600 italic">Not provided</span>
      )}
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <span className="font-medium text-slate-300 dark:text-slate-600 italic">Not provided</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function StatusBadge({ value }: { value?: string }) {
  const status = normalizeReviewStatus(value);
  const styles: Record<string, string> = {
    Approved: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40",
    Rejected: "bg-red-50 text-red-600 dark:bg-red-950/40",
    "In Review": "bg-blue-50 text-blue-600 dark:bg-blue-950/40",
    Pending: "bg-amber-50 text-amber-600 dark:bg-amber-950/40",
  };
  const label = status || value || "Pending";
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide ${
        styles[label] || "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
      }`}
    >
      {label}
    </span>
  );
}

function Section({
  title,
  icon,
  onEdit,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          {icon} {title}
        </h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline"
          >
            <MdEdit className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Step6ReviewSubmit() {
  const {
    goToPrevStep,
    setCurrentStep,
    registrationData,
    setRegistrationData,
    markStepCompleted,
    refreshRegistration,
  } = useOnboardingPartner();
  const submitRegistration = useSubmitRegistration();
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Always re-read the registration here: the previous step's completion call
  // answers with a status object, so what is in context may be a stub.
  useEffect(() => {
    refreshRegistration()
      .catch((err) => {
        console.error("Failed to fetch fresh data for review", err);
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, []);

  const data = registrationData as unknown as Row | null;

  const owners = useMemo(() => {
    const list = registrationData?.beneficialOwners;
    return Array.isArray(list) ? (list as Row[]) : [];
  }, [registrationData]);

  const documents = useMemo(() => {
    const collections = ["documents", "companyDocuments", "uploadedDocuments", "documentUploads"];
    return collections.flatMap((key) => {
      const value = data?.[key];
      return Array.isArray(value) ? (value as Row[]) : [];
    });
  }, [data]);

  const registeredAddress = joinAddress(data, "");
  const operatingAddress = joinAddress(data, "operating");
  const phone = [pick(data, "phoneCountryCode"), pick(data, "phoneNumber")]
    .filter(Boolean)
    .join(" ");

  const fundingSource = pick(data, "primaryFundingSource");
  const otherFundingSource = pick(data, "otherFundingSource");

  const handleSubmit = async () => {
    if (!registrationData?.companyId) {
      setError("Company ID is missing.");
      return;
    }

    setError(null);
    try {
      const response = await submitRegistration.mutateAsync(registrationData.companyId);
      if (response) {
        // Merge: the submit endpoint answers with a status object, and replacing
        // would drop the registration the rest of the flow reads from.
        setRegistrationData(
          (prev) =>
            ({ ...(prev || {}), ...(response as Partial<RegistrationInfo>) }) as RegistrationInfo,
        );
      }
      markStepCompleted(6);
      setIsSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred while submitting the registration.");
    }
  };

  if (isSuccess || registrationData?.submissionStatus === "Submitted") {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <MdCheckCircle className="w-24 h-24 text-green-500 mb-6" />
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Registration Submitted!</h2>
        <p className="text-slate-600 text-center max-w-md mb-8">
          Your onboarding application has been successfully submitted for review. We will notify you once the process is complete.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8 max-w-3xl w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Review &amp; Submit</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Please review your information before final submission. Once submitted, your application will be under review.
        </p>
      </div>

      {registrationData?.approvalStatus === "Rejected" && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <MdErrorOutline className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-800 font-bold mb-1">Application Requires Updates</h3>
            <p className="text-red-600 text-sm">
              {registrationData.reviewNote || "Please review and update your application details before resubmitting."}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      {isFetching ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="flex-1 space-y-8 pb-8">
          {registrationData && (
            <div className="space-y-8 bg-transparent">
              {/* Basic Information */}
              <Section
                title="Basic Information"
                icon={<MdBusiness className="text-accent" />}
                onEdit={() => setCurrentStep(1)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <Field
                    label="Legal Business Name"
                    value={pick(data, "legalBusinessName", "companyName", "businessName")}
                  />
                  <Field label="Trading Name" value={pick(data, "tradingName")} />
                  <Field
                    label="RC/Registration Number"
                    value={pick(data, "rcNumber", "registrationNumber")}
                  />
                  <Field label="Business Type" value={pick(data, "businessType")} />
                  <Field
                    label="Country of Incorporation"
                    value={pick(data, "countryOfIncorporation", "country")}
                  />
                  <Field
                    label="Date of Incorporation"
                    value={formatDate(pick(data, "dateOfIncorporation"))}
                  />
                  <Field label="Tax ID" value={pick(data, "taxId", "taxIdentificationNumber")} />
                  <Field label="Website" value={pick(data, "website")} />
                </div>
              </Section>

              {/* Contact Information */}
              <Section
                title="Contact Information"
                icon={<MdOutlineContactPhone className="text-accent" />}
                onEdit={() => setCurrentStep(2)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <Field label="Business Email" value={pick(data, "businessEmail", "email")} />
                  <Field label="Phone Number" value={phone || undefined} />
                  <div className="md:col-span-2">
                    <Field label="Registered Address" value={registeredAddress} />
                  </div>
                  <div className="md:col-span-2">
                    <Field
                      label="Operating Address"
                      value={
                        operatingAddress && operatingAddress !== registeredAddress
                          ? operatingAddress
                          : registeredAddress
                            ? "Same as registered address"
                            : undefined
                      }
                    />
                  </div>
                </div>
              </Section>

              {/* Additional Details */}
              <Section
                title="Additional Details"
                icon={<MdInfoOutline className="text-accent" />}
                onEdit={() => setCurrentStep(3)}
              >
                <div className="space-y-4 text-sm">
                  <Field label="Business Description" value={pick(data, "businessDescription")} />
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-xs mb-1.5">
                      Services Requested
                    </span>
                    <Chips items={pickList(data, "servicesRequested", "services")} />
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-xs mb-1.5">
                      Digital Asset Services
                    </span>
                    <Chips items={pickList(data, "digitalAssetServices", "digitalAssetsServices")} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label="Primary Funding Source"
                      value={
                        fundingSource === "Other" && otherFundingSource
                          ? `Other — ${otherFundingSource}`
                          : fundingSource || otherFundingSource
                      }
                    />
                    <Field
                      label="Estimated Monthly Volume"
                      value={formatMoney(pick(data, "estimatedMonthlyVolume"))}
                    />
                    <Field
                      label="Estimated Annual Revenue"
                      value={formatMoney(pick(data, "estimatedAnnualRevenue"))}
                    />
                  </div>
                </div>
              </Section>

              {/* Payment Details */}
              <Section
                title="Payment Details"
                icon={<MdOutlineAccountBalance className="text-accent" />}
                onEdit={() => setCurrentStep(3)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <Field label="Bank Name" value={pick(data, "bankName")} />
                  <Field label="Account Name" value={pick(data, "accountName")} />
                  <Field label="Account Number" value={pick(data, "accountNumber")} />
                  <Field label="Routing Number" value={pick(data, "routingNumber")} />
                  <Field label="SWIFT Code" value={pick(data, "swiftCode")} />
                  <Field label="Bank Address" value={pick(data, "bankAddress")} />
                </div>
              </Section>

              {/* Beneficial Owners */}
              <Section
                title={`Beneficial Owners${owners.length ? ` (${owners.length})` : ""}`}
                icon={<MdOutlinePeople className="text-accent" />}
                onEdit={() => setCurrentStep(4)}
              >
                {owners.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">No beneficial owners added.</p>
                ) : (
                  <div className="space-y-4">
                    {owners.map((owner, idx) => {
                      const roles = [
                        owner.isShareholder ? "Shareholder" : null,
                        owner.isDirector ? "Director" : null,
                        owner.isLegalRepresentative ? "Legal Representative" : null,
                      ].filter(Boolean) as string[];

                      return (
                        <div
                          key={(owner.id as string) || idx}
                          className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl text-sm"
                        >
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <h4 className="font-bold text-slate-800 dark:text-white">
                              {[pick(owner, "firstName"), pick(owner, "lastName")]
                                .filter(Boolean)
                                .join(" ") || `Owner ${idx + 1}`}
                            </h4>
                            <Chips items={roles} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field label="Email" value={pick(owner, "email")} />
                            <Field
                              label="Phone Number"
                              value={
                                [pick(owner, "phoneCountryCode"), pick(owner, "phoneNumber")]
                                  .filter(Boolean)
                                  .join(" ") || undefined
                              }
                            />
                            <Field
                              label="Date of Birth"
                              value={formatDate(pick(owner, "dateOfBirth"))}
                            />
                            <Field
                              label="Ownership Percentage"
                              value={
                                owner.ownershipPercentage !== undefined &&
                                owner.ownershipPercentage !== null
                                  ? `${owner.ownershipPercentage}%`
                                  : undefined
                              }
                            />
                            <Field label="BVN" value={pick(owner, "bvn")} />
                            <Field
                              label="National ID"
                              value={pick(owner, "nationalIdNumber", "nationalId")}
                            />
                            <Field label="Source of Wealth" value={pick(owner, "sourceOfWealth")} />
                            <div className="md:col-span-2">
                              <Field label="Address" value={joinAddress(owner, "")} />
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Identity
                              </span>
                              <StatusBadge value={pick(owner, "verificationStatus")} />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Proof of Wealth
                              </span>
                              <StatusBadge value={pick(owner, "proofOfWealthStatus")} />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Proof of Address
                              </span>
                              <StatusBadge value={pick(owner, "proofOfAddressStatus")} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Section>

              {/* Documents */}
              {documents.length > 0 && (
                <Section
                  title={`Documents (${documents.length})`}
                  icon={<MdOutlineDescription className="text-accent" />}
                  onEdit={() => setCurrentStep(5)}
                >
                  <div className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                    {documents.map((doc, idx) => {
                      const url = pick(doc, "url", "fileUrl", "documentUrl", "downloadUrl", "contentUrl", "path");
                      return (
                        <div
                          key={(doc.id as string) || idx}
                          className="py-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-slate-800 dark:text-slate-100 truncate">
                              {pick(doc, "title", "documentType", "name", "type", "category") ||
                                `Document ${idx + 1}`}
                            </span>
                            <StatusBadge value={pick(doc, "status", "docStatus", "documentStatus", "approvalStatus")} />
                          </div>
                          {url && (
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 text-accent hover:underline font-medium"
                            >
                              View
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-between border-t border-slate-100 dark:border-slate-700 pt-6">
            <button
              onClick={goToPrevStep}
              disabled={submitRegistration.isPending}
              className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitRegistration.isPending}
              className="flex items-center justify-center px-8 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-70 min-w-[160px]"
            >
              {submitRegistration.isPending ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : registrationData?.approvalStatus === "Rejected" ? (
                "Resubmit Application"
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
