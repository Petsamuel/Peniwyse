"use client";

import { useOnboardingPartner } from "../../context/OnboardingContext";
import { useState, useEffect } from "react";
import { useUpdateBasicInfo, RegistrationInfo } from "@/app/hooks/use-onboarding";
import { normalizeText } from "@/app/utils/format";
import { z } from "zod";

// Validated against normalized values — otherwise a lone space satisfies
// `min(1)` and passes as a company name.
const basicInfoSchema = z.object({
  legalName: z.string().min(1, "Legal Business Name is required"),
  tradingName: z.string().optional(),
  businessType: z.string().min(1, "Business Type is required"),
  country: z.string().min(1, "Country of Incorporation is required"),
  dateOfIncorporation: z.string().min(1, "Date of Incorporation is required"),
  registrationNumber: z.string().min(1, "Registration Number is required"),
  taxId: z.string().min(1, "Tax ID is required"),
  website: z.string().optional(),
});

export default function Step1BasicInfo() {
  const { markStepCompleted, goToNextStep, companyId, registrationData, setRegistrationData } = useOnboardingPartner();
  const updateBasicInfo = useUpdateBasicInfo();

  const initialWebsite = registrationData?.website || "";
  
  // Local state for the form, initialized from context if available
  const [formData, setFormData] = useState({
    legalName: registrationData?.legalBusinessName || "",
    tradingName: registrationData?.tradingName || "",
    businessType: registrationData?.businessType || "B Corporation",
    country: registrationData?.countryOfIncorporation || "Nigeria",
    dateOfIncorporation: registrationData?.dateOfIncorporation?.split("T")[0] || "",
    registrationNumber: registrationData?.rcNumber || "",
    taxId: registrationData?.taxId || "",
    website: initialWebsite.replace(/^https?:\/\//, ""),
  });

  /* eslint-disable react-hooks/set-state-in-effect -- the registration arrives
     from the server after this form has mounted, so the fields are seeded here. */
  useEffect(() => {
    if (registrationData) {
      setFormData((prev) => ({
        legalName: registrationData.legalBusinessName || prev.legalName,
        tradingName: registrationData.tradingName || prev.tradingName,
        businessType: registrationData.businessType || prev.businessType,
        country: registrationData.countryOfIncorporation || prev.country,
        dateOfIncorporation: registrationData.dateOfIncorporation?.split("T")[0] || prev.dateOfIncorporation,
        registrationNumber: registrationData.rcNumber || prev.registrationNumber,
        taxId: registrationData.taxId || prev.taxId,
        website: registrationData.website ? registrationData.website.replace(/^https?:\/\//, "") : prev.website,
      }));
    }
  }, [registrationData]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "website") {
      setFormData((prev) => ({ ...prev, [name]: value.replace(/^https?:\/\//, "") }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  /** Tidies a text field the moment focus leaves it, rather than at submit. */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const cleaned = normalizeText(value);
    if (cleaned !== value) {
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    }
  };

  const getInputClassName = (fieldName: string) => {
    const hasError = !!errors[fieldName];
    return `w-full h-12 px-4 rounded-xl border ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-accent focus:ring-accent'} focus:outline-none focus:ring-1 transition-colors bg-white text-sm`;
  };

  const getSelectClassName = (fieldName: string, extraClasses: string = "") => {
    const hasError = !!errors[fieldName];
    return `w-full h-12 appearance-none rounded-xl border ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-accent focus:ring-accent'} focus:outline-none focus:ring-1 transition-colors bg-white text-sm ${extraClasses}`;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      // If manually filling and no companyId yet, maybe we shouldn't block them entirely,
      // but the API requires companyId. For now, we proceed to next step or show error.
      // Assuming they must have a companyId to proceed for backend integration.
      console.warn("No companyId present");
      // Let's just proceed for now to allow UI flow testing, or ideally wait for backend logic.
      markStepCompleted(1);
      goToNextStep();
      return;
    }

    // Clean the text fields once, then validate, save and display that same
    // value — so what the partner ends up seeing is exactly what was stored.
    const cleaned = {
      ...formData,
      legalName: normalizeText(formData.legalName),
      tradingName: normalizeText(formData.tradingName),
      businessType: normalizeText(formData.businessType),
      country: normalizeText(formData.country),
      registrationNumber: normalizeText(formData.registrationNumber),
      taxId: normalizeText(formData.taxId),
      website: formData.website.trim(),
    };
    setFormData(cleaned);

    const validation = basicInfoSchema.safeParse(cleaned);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue: z.ZodIssue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const data = await updateBasicInfo.mutateAsync({
        companyId,
        payload: {
          legalBusinessName: cleaned.legalName,
          tradingName: cleaned.tradingName,
          businessType: cleaned.businessType,
          countryOfIncorporation: cleaned.country,
          dateOfIncorporation: cleaned.dateOfIncorporation,
          registrationNumber: cleaned.registrationNumber,
          taxId: cleaned.taxId,
          website: cleaned.website ? `https://${cleaned.website}` : "",
        },
      });
      setRegistrationData((prev) => 
        ({ ...(prev || {}), ...(data as unknown as Partial<RegistrationInfo>) }) as RegistrationInfo
      );
      markStepCompleted(1);
      goToNextStep();
    } catch (error) {
      console.error(error);
      // Handle error state here if needed
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Basic Information</h2>
        <p className="text-slate-500 text-sm">Please provide basic information about your business</p>
      </div>

      <form onSubmit={handleNext} className="flex flex-col flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          {/* Legal Business Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Legal Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="legalName"
              placeholder="Company name"
              value={formData.legalName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClassName("legalName")}
            />
            {errors.legalName && <span className="text-xs text-red-500">{errors.legalName}</span>}
          </div>

          {/* Trading Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600">Trading Name (Edit if different)</label>
            <input
              type="text"
              name="tradingName"
              value={formData.tradingName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClassName("tradingName")}
            />
          </div>

          {/* Business Type */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Business Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className={getSelectClassName("businessType", "px-4")}
              >
                <option value="B Corporation">B Corporation</option>
                <option value="LLC">LLC</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
              </select>
              <svg
                className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {errors.businessType && <span className="text-xs text-red-500">{errors.businessType}</span>}
          </div>

          {/* Country of Incorporation */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Country of Incorporation <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={getSelectClassName("country", "px-10")}
              >
                <option value="Nigeria">Nigeria</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
              </select>
              {/* Mock Flag Icon */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-3 bg-green-600 rounded-[1px] overflow-hidden flex pointer-events-none">
                <div className="w-1/3 h-full bg-green-600"></div>
                <div className="w-1/3 h-full bg-white"></div>
                <div className="w-1/3 h-full bg-green-600"></div>
              </div>
              <svg
                className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {errors.country && <span className="text-xs text-red-500">{errors.country}</span>}
          </div>

          {/* Date of Incorporation */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Date of Incorporation <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateOfIncorporation"
              value={formData.dateOfIncorporation}
              onChange={handleChange}
              className={getInputClassName("dateOfIncorporation") + " text-slate-600"}
            />
            {errors.dateOfIncorporation && <span className="text-xs text-red-500">{errors.dateOfIncorporation}</span>}
          </div>

          {/* Registration Number */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Registration Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClassName("registrationNumber")}
            />
            {errors.registrationNumber && <span className="text-xs text-red-500">{errors.registrationNumber}</span>}
          </div>

          {/* Tax ID */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Tax ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              onBlur={handleBlur}
              className={getInputClassName("taxId")}
            />
            {errors.taxId && <span className="text-xs text-red-500">{errors.taxId}</span>}
          </div>

          {/* Website */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600">Website</label>
            <div className={`relative flex items-center w-full h-12 rounded-xl border ${errors.website ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500' : 'border-slate-200 focus-within:border-accent focus-within:ring-accent'} focus-within:ring-1 transition-colors bg-white overflow-hidden`}>
              <span className="px-3 text-slate-500 text-sm bg-slate-50 border-r border-slate-200 h-full flex items-center pointer-events-none">
                https://
              </span>
              <input
                type="text"
                name="website"
                placeholder="credlanche.com"
                value={formData.website}
                onChange={handleChange}
                className="flex-1 px-3 h-full focus:outline-none text-sm bg-transparent"
              />
            </div>
            {errors.website && <span className="text-xs text-red-500">{errors.website}</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex justify-end">
          <button
            type="submit"
            disabled={updateBasicInfo.isPending}
            className="px-8 py-3 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateBasicInfo.isPending ? "Saving..." : "Next"}
          </button>
        </div>
      </form>
    </div>
  );
}
