"use client";

import { useState } from "react";
import { useOnboardingPartner } from "../../context/OnboardingContext";
import {
  useUpdateAdditionalDetails,
  RegistrationInfo,
} from "@/app/hooks/use-onboarding";
import Select, { StylesConfig } from "react-select";
import { MdInfo } from "react-icons/md";

const SERVICE_OPTIONS = [
  { value: "Digital Assets", label: "Digital Assets" },
  { value: "FX", label: "FX/Cross border payment" },
];

const DIGITAL_ASSETS_OPTIONS = [
  { value: "Trading", label: "Trading" },
  { value: "Custody", label: "Custody" },
  { value: "Payments", label: "Payments" },
  // { value: "Tokenization", label: "Tokenization" },
  { value: "Off-Ramp", label: "Off-Ramp" },
  { value: "On-Ramp", label: "On-Ramp" },
];

export default function Step3AdditionalDetails() {
  const {
    markStepCompleted,
    goToNextStep,
    goToPrevStep,
    companyId,
    registrationData,
    setRegistrationData,
  } = useOnboardingPartner();
  const updateAdditionalDetails = useUpdateAdditionalDetails();

  const defaultFundingSources = [
    "Customer Funds",
    "Investor Funds",
    "Crowd Fundings",
    "Investment Returns",
    "Loan/Debit Financing",
    "ICO/IPO",
    "Grant",
  ];

  const initialFundingSource = registrationData?.primaryFundingSource || "";
  const initialOtherFundingSource = registrationData?.otherFundingSource || "";
  const initialSelectValue = initialFundingSource
    ? defaultFundingSources.includes(initialFundingSource)
      ? initialFundingSource
      : "Other"
    : "";
  const initialCustomValue =
    initialOtherFundingSource ||
    (initialSelectValue === "Other" ? initialFundingSource : "");

  const [formData, setFormData] = useState({
    businessDescription: registrationData?.businessDescription || "",
    estimatedMonthlyVolume: registrationData?.estimatedMonthlyVolume || "",
    estimatedAnnualRevenue: registrationData?.estimatedAnnualRevenue || "",
    bankName: registrationData?.bankName || "",
    accountName: registrationData?.accountName || "",
    accountNumber: registrationData?.accountNumber || "",
    routingNumber: registrationData?.routingNumber || "",
    swiftCode: registrationData?.swiftCode || "",
    bankAddress: registrationData?.bankAddress || "",
  });

  const [fundingSourceSelect, setFundingSourceSelect] =
    useState(initialSelectValue);
  const [customFundingSource, setCustomFundingSource] =
    useState(initialCustomValue);

  const [selectedServices, setSelectedServices] = useState<
    { value: string; label: string }[]
  >(
    (
      registrationData?.servicesRequested ||
      registrationData?.services ||
      []
    )?.map((s: string) => ({ value: s, label: s })) || [],
  );

  const [selectedDigitalAssetsServices, setSelectedDigitalAssetsServices] =
    useState<{ value: string; label: string }[]>(
      (
        registrationData?.digitalAssetServices ||
        registrationData?.digitalAssetsServices ||
        []
      )?.map((s: string) => ({ value: s, label: s })) || [],
    );

  const [error, setError] = useState("");
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (missingFields.includes(name)) {
      setMissingFields((prev) => prev.filter((f) => f !== name));
    }
  };

  const getInputClassName = (fieldName: string, extraClasses: string = "") => {
    const isMissing = missingFields.includes(fieldName);
    return `w-full h-11 px-4 rounded-xl border ${isMissing ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-200 dark:border-slate-600 focus:border-accent focus:ring-accent"} focus:outline-none focus:ring-1 transition-colors bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm ${extraClasses}`;
  };

  const getTextareaClassName = (
    fieldName: string,
    extraClasses: string = "",
  ) => {
    const isMissing = missingFields.includes(fieldName);
    return `w-full p-4 rounded-xl border ${isMissing ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-200 dark:border-slate-600 focus:border-accent focus:ring-accent"} focus:outline-none focus:ring-1 transition-colors bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm resize-none ${extraClasses}`;
  };

  const getSelectStyles = (fieldName: string): StylesConfig => {
    const isMissing = missingFields.includes(fieldName);
    return {
      control: (base, state) => ({
        ...base,
        minHeight: "44px",
        borderRadius: "0.75rem",
        borderColor: isMissing
          ? "#ef4444"
          : state.isFocused
            ? "#185fa5"
            : "#e2e8f0",
        boxShadow: isMissing
          ? "0 0 0 1px #ef4444"
          : state.isFocused
            ? "0 0 0 1px #185fa5"
            : "none",
        "&:hover": {
          borderColor: isMissing
            ? "#ef4444"
            : state.isFocused
              ? "#185fa5"
              : "#cbd5e1",
        },
      }),
    };
  };

  const handleNext = async () => {
    if (!companyId) {
      setError("Company ID is missing. Please start again.");
      return;
    }

    const newMissingFields: string[] = [];
    if (!formData.businessDescription)
      newMissingFields.push("businessDescription");
    if (selectedServices.length === 0)
      newMissingFields.push("selectedServices");
    if (
      selectedServices.some((s) => s.value === "Digital Assets") &&
      selectedDigitalAssetsServices.length === 0
    ) {
      newMissingFields.push("selectedDigitalAssetsServices");
    }
    if (!formData.estimatedMonthlyVolume)
      newMissingFields.push("estimatedMonthlyVolume");
    if (!formData.estimatedAnnualRevenue)
      newMissingFields.push("estimatedAnnualRevenue");
    if (!fundingSourceSelect) newMissingFields.push("fundingSourceSelect");
    if (fundingSourceSelect === "Other" && !customFundingSource)
      newMissingFields.push("customFundingSource");
    // Routing number and SWIFT code are region specific, so neither is required.
    if (!formData.bankName) newMissingFields.push("bankName");
    if (!formData.accountName) newMissingFields.push("accountName");
    if (!formData.accountNumber) newMissingFields.push("accountNumber");

    if (newMissingFields.length > 0) {
      setMissingFields(newMissingFields);
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setError("");

      const data = await updateAdditionalDetails.mutateAsync({
        companyId,
        payload: {
          businessDescription: formData.businessDescription,
          estimatedMonthlyVolume: Number(formData.estimatedMonthlyVolume) || 0,
          estimatedAnnualRevenue: Number(formData.estimatedAnnualRevenue) || 0,
          primaryFundingSource:
            fundingSourceSelect === "Other" ? "Other" : fundingSourceSelect,
          otherFundingSource:
            fundingSourceSelect === "Other" ? customFundingSource : "",
          services: selectedServices.map((s) => s.value),
          digitalAssetsServices: selectedDigitalAssetsServices.map(
            (s) => s.value,
          ),
          bankName: formData.bankName.trim(),
          accountName: formData.accountName.trim(),
          accountNumber: formData.accountNumber.trim(),
          routingNumber: formData.routingNumber.trim(),
          swiftCode: formData.swiftCode.trim(),
          bankAddress: formData.bankAddress.trim(),
        },
      });
      setRegistrationData(
        (prev) =>
          ({
            ...(prev || {}),
            ...(data as unknown as Partial<RegistrationInfo>),
          }) as RegistrationInfo,
      );

      markStepCompleted(3);
      goToNextStep();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update additional details. Please try again.",
      );
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mt-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Additional Details
        </h2>
        <p className="text-slate-500 text-sm">
          Please provide additional business details.
        </p>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-5 flex-1">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Business Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="businessDescription"
            value={formData.businessDescription}
            onChange={handleChange}
            placeholder="Tell us about what your company does..."
            rows={4}
            className={getTextareaClassName("businessDescription")}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-0.5">
            What services would you want to access? <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-2 italic">
            Please select the services you want to access through our platform
            or API
          </p>
          <Select
            isMulti
            options={SERVICE_OPTIONS}
            value={selectedServices}
            onChange={(newValue) => {
              setSelectedServices(
                newValue as { value: string; label: string }[],
              );
              if (missingFields.includes("selectedServices"))
                setMissingFields((prev) =>
                  prev.filter((f) => f !== "selectedServices"),
                );
            }}
            className="text-sm"
            styles={getSelectStyles("selectedServices")}
            placeholder="Select..."
          />
        </div>

        {selectedServices.some((s) => s.value === "Digital Assets") && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              What Digital Assets services would you like to access? <span className="text-red-500">*</span>
            </label>
            <Select
              isMulti
              options={DIGITAL_ASSETS_OPTIONS}
              value={selectedDigitalAssetsServices}
              onChange={(newValue) => {
                setSelectedDigitalAssetsServices(
                  newValue as { value: string; label: string }[],
                );
                if (missingFields.includes("selectedDigitalAssetsServices"))
                  setMissingFields((prev) =>
                    prev.filter((f) => f !== "selectedDigitalAssetsServices"),
                  );
              }}
              className="text-sm"
              styles={getSelectStyles("selectedDigitalAssetsServices")}
              placeholder="Select..."
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Estimated Monthly Volume <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                type="number"
                name="estimatedMonthlyVolume"
                value={formData.estimatedMonthlyVolume}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={getInputClassName("estimatedMonthlyVolume", "pl-8")}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Estimated Annual Revenue <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                type="number"
                name="estimatedAnnualRevenue"
                value={formData.estimatedAnnualRevenue}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={getInputClassName("estimatedAnnualRevenue", "pl-8")}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Primary Funding Source <span className="text-red-500">*</span>
          </label>
          <select
            value={fundingSourceSelect}
            onChange={(e) => {
              setFundingSourceSelect(e.target.value);
              if (missingFields.includes("fundingSourceSelect"))
                setMissingFields((prev) =>
                  prev.filter((f) => f !== "fundingSourceSelect"),
                );
            }}
            className={getInputClassName("fundingSourceSelect", "mb-2")}
          >
            <option value="" disabled>
              Select Funding Source
            </option>
            {defaultFundingSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>

          {fundingSourceSelect === "Other" && (
            <input
              type="text"
              value={customFundingSource}
              onChange={(e) => {
                setCustomFundingSource(e.target.value);
                if (missingFields.includes("customFundingSource"))
                  setMissingFields((prev) =>
                    prev.filter((f) => f !== "customFundingSource"),
                  );
              }}
              placeholder="Enter your funding source"
              className={getInputClassName(
                "customFundingSource",
                "mt-2 animate-in fade-in slide-in-from-top-2",
              )}
            />
          )}
        </div>

        {/* ── Settlement account ── */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className=" px-4 py-5 mb-5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Account details
            </h3>
            <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mt-1">
              <MdInfo className="w-4 h-4 shrink-0 text-slate-700 dark:text-slate-200" />
              Please provide the your Account details
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="e.g. First National Bank"
                className={getInputClassName("bankName")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                placeholder="Name on the account"
                className={getInputClassName("accountName")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Account number or IBAN"
                className={getInputClassName("accountNumber")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Routing Number
              </label>
              <input
                type="text"
                name="routingNumber"
                value={formData.routingNumber}
                onChange={handleChange}
                placeholder="If your bank uses one"
                className={getInputClassName("routingNumber")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                SWIFT Code
              </label>
              <input
                type="text"
                name="swiftCode"
                value={formData.swiftCode}
                onChange={handleChange}
                placeholder="e.g. ABCDNGLA"
                className={getInputClassName("swiftCode")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Bank Address
              </label>
              <input
                type="text"
                name="bankAddress"
                value={formData.bankAddress}
                onChange={handleChange}
                placeholder="Branch address"
                className={getInputClassName("bankAddress")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 mb-4 flex justify-between">
        <button
          onClick={goToPrevStep}
          disabled={updateAdditionalDetails.isPending}
          className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={updateAdditionalDetails.isPending}
          className="px-8 py-3 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {updateAdditionalDetails.isPending ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
}
