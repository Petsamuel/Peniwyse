"use client";

import { useState, useMemo, useEffect } from "react";
import { useOnboardingPartner } from "../../context/OnboardingContext";
import { useUpdateBeneficialOwners, useCompleteBeneficialOwners, useVerifyBeneficialOwner, useUploadShareholderDocument, BeneficialOwnerPayload } from "@/app/hooks/use-onboarding";
import { useToast } from "@/app/hooks/use-toast";
import { ToastContainer } from "@/app/components/disbursement/container";
import { MdOutlinePerson, MdOutlineEmail, MdOutlineLocationOn, MdOutlinePublic, MdOutlineMap, MdOutlineSignpost, MdAdd, MdDelete, MdCheckCircle, MdOutlinePercent, MdErrorOutline, MdLink, MdContentCopy, MdRefresh, MdKeyboardArrowDown, MdKeyboardArrowUp, MdOutlineCloudUpload } from "react-icons/md";
import PhoneInput, { parsePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import Select, { SingleValue, MultiValue, ActionMeta, ClassNamesConfig } from 'react-select';
import { Country, State, City } from 'country-state-city';
import * as Flags from 'country-flag-icons/react/3x2';

interface OptionType {
  value: string;
  label: React.ReactNode;
  isoCode?: string;
}

interface SavedOwner extends BeneficialOwnerPayload {
  shareholderId?: string;
  verificationUrl?: string;
  verificationStatus?: string;
  proofOfWealthUrl?: string;
  proofOfWealthStatus?: string;
  proofOfAddressUrl?: string;
  proofOfAddressStatus?: string;
}

const getSelectClassNames = (hasIcon: boolean): ClassNamesConfig<OptionType> => ({
  control: (state) => 
    `w-full min-h-[44px] ${hasIcon ? 'pl-10' : ''} px-4 rounded-xl border ${
      state.isFocused ? 'border-accent ring-1 ring-accent' : 'border-slate-200'
    } bg-white text-sm transition-colors cursor-pointer flex items-center`,
  menu: () => "mt-1 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50 text-sm",
  option: (state) => 
    `px-4 py-2 cursor-pointer text-sm ${
      state.isFocused ? 'bg-slate-50' : ''
    } ${state.isSelected ? 'bg-accent/10 text-accent font-medium' : 'text-slate-700'}`,
  singleValue: () => "text-slate-700",
  placeholder: () => "text-slate-400",
  valueContainer: () => "flex-1 flex flex-wrap items-center gap-1 py-1 overflow-hidden",
  dropdownIndicator: () => "p-2 text-slate-400 hover:text-slate-500",
  clearIndicator: () => "p-2 text-slate-400 hover:text-slate-500",
  indicatorSeparator: () => "hidden",
  multiValue: () => "bg-accent/10 text-accent rounded-md flex items-center m-0.5",
  multiValueLabel: () => "px-2 text-xs font-medium",
  multiValueRemove: () => "hover:bg-accent/20 hover:text-accent rounded-r-md px-1 py-1 cursor-pointer",
});

const initialOwner: BeneficialOwnerPayload = {
  firstName: "",
  lastName: "",
  email: "",
  phoneCountryCode: "",
  phoneNumber: "",
  dateOfBirth: "",
  bvn: "",
  nationalIdNumber: "",
  ownershipPercentage: 0,
  streetAddress: "",
  country: "Nigeria",
  state: "",
  city: "",
  postalCode: "",
  sourceOfWealth: "",
  isShareholder: false,
  isDirector: false,
  isLegalRepresentative: false,
};

interface ApiBeneficialOwner {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  bvn?: string;
  nationalIdNumber?: string;
  ownershipPercentage?: number;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  sourceOfWealth?: string;
  isShareholder?: boolean;
  isDirector?: boolean;
  isLegalRepresentative?: boolean;
  verificationStatus?: string;
  verificationUrl?: string;
  verificationLink?: string;
  url?: string;
}

export default function Step4BeneficialOwners() {
  const { markStepCompleted, goToNextStep, goToPrevStep, companyId, registrationData, setRegistrationData } = useOnboardingPartner();
  const updateBeneficialOwners = useUpdateBeneficialOwners();
  const completeOwners = useCompleteBeneficialOwners();
  const verifyOwner = useVerifyBeneficialOwner();
  const uploadDocument = useUploadShareholderDocument();
  const { info, error: showError, success, toasts, dismiss } = useToast();

  const mapOwners = (apiOwners: ApiBeneficialOwner[]): SavedOwner[] => {
    return apiOwners.map((bo) => ({
      firstName: bo.firstName || "",
      lastName: bo.lastName || "",
      email: bo.email || "",
      phoneCountryCode: bo.phoneCountryCode || "",
      phoneNumber: bo.phoneNumber || "",
      dateOfBirth: bo.dateOfBirth ? bo.dateOfBirth.split('T')[0] : "",
      bvn: bo.bvn || "",
      nationalIdNumber: bo.nationalIdNumber || "",
      ownershipPercentage: bo.ownershipPercentage || 0,
      streetAddress: bo.address || "",
      country: bo.country || "Nigeria",
      state: bo.state || "",
      city: bo.city || "",
      postalCode: bo.postalCode || "",
      sourceOfWealth: bo.sourceOfWealth || "",
      isShareholder: bo.isShareholder ?? false,
      isDirector: bo.isDirector ?? false,
      isLegalRepresentative: bo.isLegalRepresentative ?? false,
      shareholderId: bo.id,
      verificationStatus: bo.verificationStatus || "Pending",
      verificationUrl: bo.verificationUrl || bo.verificationLink || bo.url,
    }));
  };

  const [owners, setOwners] = useState<SavedOwner[]>(() => {
    if (registrationData?.beneficialOwners) {
      return mapOwners(registrationData.beneficialOwners);
    }
    return [];
  });
  const [prevRegistrationOwners, setPrevRegistrationOwners] = useState(registrationData?.beneficialOwners);

  if (registrationData?.beneficialOwners !== prevRegistrationOwners) {
    setPrevRegistrationOwners(registrationData?.beneficialOwners);
    if (registrationData?.beneficialOwners) {
      setOwners(mapOwners(registrationData.beneficialOwners));
    }
  }

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<BeneficialOwnerPayload>(initialOwner);
  const [phoneValue, setPhoneValue] = useState<string>("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [expandedOwnerIndex, setExpandedOwnerIndex] = useState<number | null>(null);

  const totalPercentage = owners.reduce((acc, o) => acc + o.ownershipPercentage, 0);

  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map(c => {
      const Flag = Flags[c.isoCode as keyof typeof Flags] as React.ElementType;
      return {
        value: c.name,
        isoCode: c.isoCode,
        label: (
          <div className="flex items-center gap-2">
            {Flag ? (
              <div className="w-5 h-3.5 overflow-hidden rounded-[2px] shadow-sm flex-shrink-0">
                <Flag className="w-full h-full object-cover" />
              </div>
            ) : (
              <span className="w-5 h-3.5 flex-shrink-0"></span>
            )}
            <span className="truncate">{c.name}</span>
          </div>
        )
      };
    });
  }, []);

  const selectedCountryOption = countryOptions.find(o => o.value === formData.country || o.isoCode === formData.country) || null;
  const countryIsoCode = selectedCountryOption?.isoCode || '';

  const stateOptions = useMemo(() => {
    if (!countryIsoCode) return [];
    return State.getStatesOfCountry(countryIsoCode).map(s => ({
      value: s.name,
      isoCode: s.isoCode,
      label: s.name
    }));
  }, [countryIsoCode]);

  const selectedStateOption = stateOptions.find(o => o.value === formData.state || o.isoCode === formData.state) || null;
  const stateIsoCode = selectedStateOption?.isoCode || '';

  const cityOptions = useMemo(() => {
    if (!countryIsoCode || !stateIsoCode) return [];
    return City.getCitiesOfState(countryIsoCode, stateIsoCode).map(c => ({
      value: c.name,
      label: c.name
    }));
  }, [countryIsoCode, stateIsoCode]);

  const selectedCityOption = cityOptions.find(o => o.value === formData.city) || null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "ownershipPercentage" ? Number(value) : value 
    }));
    if (missingFields.includes(name)) {
      setMissingFields(prev => prev.filter(f => f !== name));
    }
  };

  const getInputClassName = (fieldName: string) => {
    const isMissing = missingFields.includes(fieldName);
    return `w-full h-11 px-4 rounded-xl border ${
      isMissing
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-slate-200 dark:border-slate-600 focus:border-accent focus:ring-accent'
    } focus:outline-none focus:ring-1 transition-colors bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500`;
  };

  const getPhoneInputClassName = () => {
    const isMissing = missingFields.includes("phoneValue");
    return `w-full h-11 px-4 rounded-xl border ${
      isMissing
        ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500'
        : 'border-slate-200 dark:border-slate-600 focus-within:border-accent focus-within:ring-accent'
    } focus-within:ring-1 transition-colors bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm`;
  };

  const handleCountryChange = (newValue: SingleValue<OptionType> | MultiValue<OptionType>) => {
    const option = newValue as SingleValue<OptionType>;
    setFormData({ ...formData, country: option?.value || "", state: "", city: "" });
  };

  const handleStateChange = (newValue: SingleValue<OptionType> | MultiValue<OptionType>) => {
    const option = newValue as SingleValue<OptionType>;
    setFormData({ ...formData, state: option?.value || "", city: "" });
  };

  const handleCityChange = (newValue: SingleValue<OptionType> | MultiValue<OptionType>) => {
    const option = newValue as SingleValue<OptionType>;
    setFormData({ ...formData, city: option?.value || "" });
  };

  const handleAddOwner = async () => {
    setError("");
    if (!companyId) {
      setError("Company ID is missing.");
      return;
    }

    const newMissingFields: string[] = [];
    if (!formData.firstName) newMissingFields.push("firstName");
    if (!formData.lastName) newMissingFields.push("lastName");
    if (!formData.email) newMissingFields.push("email");
    if (!phoneValue) newMissingFields.push("phoneValue");
    if (!formData.dateOfBirth) newMissingFields.push("dateOfBirth");
    if (!formData.postalCode) newMissingFields.push("postalCode");
    if (!formData.ownershipPercentage) newMissingFields.push("ownershipPercentage");
    if (!formData.sourceOfWealth) newMissingFields.push("sourceOfWealth");

    if (newMissingFields.length > 0) {
      setMissingFields(newMissingFields);
      setError("Please fill in all required fields (Name, Email, Phone, DOB, Postal Code, Percentage, Source of Wealth).");
      return;
    }
    
    if (totalPercentage + formData.ownershipPercentage > 100) {
      setError(`Cannot add owner: Total ownership would exceed 100% (currently ${totalPercentage}%).`);
      return;
    }

    let phoneCountryCode = "";
    let phoneNumber = "";
    
    if (phoneValue) {
      const parsed = parsePhoneNumber(phoneValue);
      if (parsed) {
        phoneCountryCode = `+${parsed.countryCallingCode}`;
        phoneNumber = parsed.nationalNumber as string;
      }
    }

    try {
      setIsSubmitting(true);
      const payload = { ...formData, phoneCountryCode, phoneNumber };
      
      const res = await updateBeneficialOwners.mutateAsync({ companyId, payload });
      const shareholderId = res?.id || res?.shareholderId;
      
      if (!shareholderId) {
        throw new Error("Failed to retrieve the ID for the created beneficial owner.");
      }
      
      const verifyRes = await verifyOwner.mutateAsync(shareholderId);
      
      setOwners(prev => [...prev, { 
        ...payload, 
        shareholderId, 
        verificationUrl: verifyRes?.url,
        verificationStatus: verifyRes?.verificationStatus
      }]);
      
      setFormData(initialOwner);
      setPhoneValue("");
      setIsAdding(false);
      setMissingFields([]);
    } catch (err: unknown) {
      let errorMessage = "Failed to add beneficial owner. Please try again.";
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.errors && Array.isArray(parsed.errors)) {
            errorMessage = parsed.errors.join("\n");
          } else if (parsed.message) {
            errorMessage = parsed.message;
          } else {
            errorMessage = err.message;
          }
        } catch (e) {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveOwner = (index: number) => {
    setOwners(prev => prev.filter((_, i) => i !== index));
  };

  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  const handleRegenerateLink = async (index: number, shareholderId: string) => {
    try {
      setRegeneratingIndex(index);
      setError("");
      const verifyRes = await verifyOwner.mutateAsync(shareholderId);
      if (verifyRes?.url) {
        setOwners(prev => {
          const newOwners = [...prev];
          newOwners[index].verificationUrl = verifyRes.url;
          newOwners[index].verificationStatus = verifyRes.verificationStatus || newOwners[index].verificationStatus;
          return newOwners;
        });
        success("Success", "Verification link generated successfully.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to regenerate link.");
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const handleUploadDocument = async (ownerIndex: number, docType: string, file: File | null) => {
    if (!file) return;
    const owner = owners[ownerIndex];
    if (!owner.shareholderId) {
      showError("Error", "Missing shareholder ID.");
      return;
    }

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("shareholderId", owner.shareholderId);
      
      let fieldName = "file";
      if (docType.toLowerCase().includes("identity")) {
        fieldName = "identityDocument";
      } else if (docType.toLowerCase().includes("address")) {
        fieldName = "proofOfAddress";
      } else if (docType.toLowerCase().includes("wealth")) {
        fieldName = "proofOfWealth";
      }
      
      uploadFormData.append(fieldName, file);

      info("Uploading", `Uploading ${docType}...`);
      const updatedData = await uploadDocument.mutateAsync(uploadFormData);
      
      if (updatedData) {
        setRegistrationData(updatedData);
      }

      success("Success", `${docType} uploaded successfully.`);
    } catch (err: unknown) {
      showError("Error", err instanceof Error ? err.message : "Failed to upload document");
    }
  };

  const handleNext = async () => {
    if (!companyId) {
      setError("Company ID is missing. Please start again.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await completeOwners.mutateAsync(companyId);
      
      setRegistrationData(prev => {
        if (response && response.companyId) {
          return response;
        }
        if (prev) {
          return { ...prev, beneficialOwners: owners };
        }
        return prev;
      });

      markStepCompleted(4);
      goToNextStep();
    } catch (err: unknown) {
      let errorMessage = "Failed to complete beneficial owners step. Please try again.";
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.errors && Array.isArray(parsed.errors)) {
            errorMessage = parsed.errors.join("\n");
          } else if (parsed.message) {
            errorMessage = parsed.message;
          } else {
            errorMessage = err.message;
          }
        } catch (e) {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8 max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Beneficial Owners</h2>
        <p className="text-slate-500 text-sm mb-6">Add every individual who owns more than 25% of the business</p>
        
        <div className="flex items-center gap-2 mb-6 text-xs text-slate-400">
          <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center shrink-0">
            <span className="text-white text-[10px]">➔</span>
          </div>
          <p><strong className="font-semibold text-slate-600">Beneficial Owner:</strong> An individual who owns more than 25% of the business</p>
        </div>

        {/* <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-slate-600 text-sm font-medium">Beneficial Owners are optional to fill right now. If added, they must complete KYC before submission.</p>
        </div> */}
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <MdErrorOutline className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            {error.split('\n').map((errLine, i) => (
              <span key={i}>{errLine}</span>
            ))}
          </div>
        </div>
      )}

      {!isAdding && (
        <div className="space-y-4 mb-8">
          {owners.map((owner, idx) => (
            <div key={idx} className="p-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div 
                  className="flex items-center gap-4 cursor-pointer group" 
                  onClick={() => setExpandedOwnerIndex(expandedOwnerIndex === idx ? null : idx)}
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
                    <MdOutlinePerson className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1 group-hover:text-accent transition-colors">
                      {owner.firstName} {owner.lastName}
                      {expandedOwnerIndex === idx ? (
                        <MdKeyboardArrowUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <MdKeyboardArrowDown className="w-4 h-4 text-slate-400" />
                      )}
                    </h3>
                    <p className="text-xs text-slate-500">{owner.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {owner.isShareholder && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-semibold">Shareholder</span>
                      )}
                      {owner.isDirector && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded-full text-[10px] font-semibold">Director</span>
                      )}
                      {!owner.isShareholder && !owner.isDirector && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-full text-[10px] font-semibold">Beneficial Owner</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {owner.verificationUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(owner.verificationUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="px-4 py-1.5 bg-accent hover:bg-accent/90 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                    >
                      Verify Identity Now
                    </button>
                  )}
                  <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium text-slate-600">
                    {owner.ownershipPercentage}%
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveOwner(idx);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <MdDelete className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {expandedOwnerIndex === idx && (
                <div className="grid grid-cols-2 gap-4 mt-2 p-4 bg-slate-50 rounded-lg text-sm border border-slate-100">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Phone Number</p>
                    <p className="font-medium text-slate-700">{owner.phoneCountryCode} {owner.phoneNumber} {(!owner.phoneNumber && !owner.phoneCountryCode) && "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Date of Birth</p>
                    <p className="font-medium text-slate-700">{owner.dateOfBirth || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Address</p>
                    <p className="font-medium text-slate-700">{owner.streetAddress || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Location</p>
                    <p className="font-medium text-slate-700">{[owner.city, owner.state, owner.country].filter(Boolean).join(", ") || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">BVN</p>
                    <p className="font-medium text-slate-700">{owner.bvn || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">National ID</p>
                    <p className="font-medium text-slate-700">{owner.nationalIdNumber || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-500 text-xs mb-1">Source of Wealth</p>
                    <p className="font-medium text-slate-700">{owner.sourceOfWealth || "N/A"}</p>
                  </div>
                </div>
              )}

              <div className="mt-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verification Link</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${owner.verificationUrl ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                    {owner.verificationUrl ? (owner.verificationStatus === 'Pending' ? 'Active' : owner.verificationStatus) : 'Inactive'}
                  </span>
                </div>
                {owner.verificationUrl ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-xs text-slate-600 dark:text-slate-300 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                      {owner.verificationUrl}
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleRegenerateLink(idx, owner.shareholderId || "")}
                        disabled={regeneratingIndex === idx || !owner.shareholderId}
                        className="p-2 text-slate-500 hover:text-accent hover:bg-accent/10 rounded-md transition-colors disabled:opacity-50"
                        title="Regenerate Link"
                      >
                        <MdRefresh className={`w-4 h-4 ${regeneratingIndex === idx ? 'animate-spin' : ''}`} />
                      </button>
                      <button 
                        onClick={() => navigator.clipboard.writeText(owner.verificationUrl || "")}
                        className="p-2 text-slate-500 hover:text-accent hover:bg-accent/10 rounded-md transition-colors"
                        title="Copy Link"
                      >
                        <MdContentCopy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-slate-500 italic">No verification link generated yet.</div>
                    <button 
                      onClick={() => handleRegenerateLink(idx, owner.shareholderId || "")}
                      disabled={regeneratingIndex === idx || !owner.shareholderId}
                      className="px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <MdLink className="w-3.5 h-3.5" />
                      {regeneratingIndex === idx ? "Generating..." : "Generate Link"}
                    </button>
                  </div>
                )}
                
                {owner.shareholderId && (
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Proof of Source of Wealth */}
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-700">Proof of Source of Wealth</span>
                        <span className="text-[10px] text-slate-500">{owner.proofOfWealthStatus === 'Uploaded' ? 'Uploaded' : 'Pending Upload'}</span>
                      </div>
                      <div className="shrink-0 relative">
                        <input
                          type="file"
                          id={`pow-${owner.shareholderId}`}
                          className="hidden"
                          onChange={(e) => handleUploadDocument(idx, "Proof of Wealth", e.target.files?.[0] || null)}
                        />
                        <label
                          htmlFor={`pow-${owner.shareholderId}`}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
                            owner.proofOfWealthStatus === 'Uploaded' 
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                              : 'bg-accent/10 text-accent hover:bg-accent/20'
                          }`}
                        >
                          <MdOutlineCloudUpload className="w-4 h-4" />
                          {owner.proofOfWealthStatus === 'Uploaded' ? 'Change File' : 'Upload'}
                        </label>
                      </div>
                    </div>

                    {/* Proof of Address */}
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-700">Proof of Address</span>
                        <span className="text-[10px] text-slate-500">{owner.proofOfAddressStatus === 'Uploaded' ? 'Uploaded' : 'Pending Upload'}</span>
                      </div>
                      <div className="shrink-0 relative">
                        <input
                          type="file"
                          id={`poa-${owner.shareholderId}`}
                          className="hidden"
                          onChange={(e) => handleUploadDocument(idx, "Proof of Address", e.target.files?.[0] || null)}
                        />
                        <label
                          htmlFor={`poa-${owner.shareholderId}`}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-colors ${
                            owner.proofOfAddressStatus === 'Uploaded' 
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                              : 'bg-accent/10 text-accent hover:bg-accent/20'
                          }`}
                        >
                          <MdOutlineCloudUpload className="w-4 h-4" />
                          {owner.proofOfAddressStatus === 'Uploaded' ? 'Change File' : 'Upload'}
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {owners.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500">
              No beneficial owners added yet.
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm font-medium text-slate-600">
              Total Ownership: <span className={totalPercentage > 100 ? "text-red-500" : "text-accent"}>{totalPercentage}%</span>
            </div>
            <button
              onClick={() => { setIsAdding(true); setMissingFields([]); setError(""); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors flex items-center gap-2 text-sm"
            >
              <MdAdd className="w-4 h-4" />
              Add Owner
            </button>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <MdOutlinePerson className="text-accent" />
            New Beneficial Owner
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name <span className="text-accent">*</span></label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={getInputClassName("firstName")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name <span className="text-accent">*</span></label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={getInputClassName("lastName")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email <span className="text-accent">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={getInputClassName("email")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number <span className="text-accent">*</span></label>
              <PhoneInput international defaultCountry="NG" value={phoneValue} onChange={(val) => { setPhoneValue(val ? val.toString() : ""); if (missingFields.includes("phoneValue")) setMissingFields(prev => prev.filter(f => f !== "phoneValue")); }} className={getPhoneInputClassName()} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Birth <span className="text-accent">*</span></label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={getInputClassName("dateOfBirth")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ownership Percentage (%) <span className="text-accent">*</span></label>
              <input type="number" name="ownershipPercentage" value={formData.ownershipPercentage || ""} onChange={handleChange} min="0" max="100" className={getInputClassName("ownershipPercentage")} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">BVN</label>
              <input type="text" name="bvn" value={formData.bvn} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">National ID Number</label>
              <input type="text" name="nationalIdNumber" value={formData.nationalIdNumber} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Street Address</label>
              <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Country</label>
              <Select unstyled classNames={getSelectClassNames(false)} options={countryOptions} value={selectedCountryOption} onChange={handleCountryChange} placeholder="Select Country" isClearable isSearchable />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">State/Province</label>
              <Select unstyled classNames={getSelectClassNames(false)} options={stateOptions} value={selectedStateOption} onChange={handleStateChange} placeholder={countryIsoCode ? "Select State" : "Select Country first"} isDisabled={!countryIsoCode} isClearable isSearchable />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
              <Select unstyled classNames={getSelectClassNames(false)} options={cityOptions} value={selectedCityOption} onChange={handleCityChange} placeholder={stateIsoCode ? "Select City" : "Select State first"} isDisabled={!stateIsoCode} isClearable isSearchable />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Postal Code <span className="text-accent">*</span></label>
              <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className={getInputClassName("postalCode")} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Source of Wealth <span className="text-accent">*</span></label>
              <input type="text" name="sourceOfWealth" value={formData.sourceOfWealth} onChange={handleChange} className={getInputClassName("sourceOfWealth")} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Role(s) in the Company</label>
              <p className="text-xs text-slate-500 mb-3">Select all that apply.</p>
              <Select
                isMulti
                unstyled
                classNames={getSelectClassNames(false)}
                options={[
                  { value: 'isShareholder', label: 'Shareholder' },
                  { value: 'isDirector', label: 'Director' },
                  { value: 'isLegalRepresentative', label: 'Legal Representative' }
                ] as OptionType[]}
                value={[
                  ...(formData.isShareholder ? [{ value: 'isShareholder', label: 'Shareholder' }] : []),
                  ...(formData.isDirector ? [{ value: 'isDirector', label: 'Director' }] : []),
                  ...(formData.isLegalRepresentative ? [{ value: 'isLegalRepresentative', label: 'Legal Representative' }] : [])
                ] as OptionType[]}
                onChange={(newValue) => {
                  const selectedOptions = (newValue as MultiValue<OptionType>) || [];
                  setFormData(prev => ({
                    ...prev,
                    isShareholder: selectedOptions.some(opt => opt.value === 'isShareholder'),
                    isDirector: selectedOptions.some(opt => opt.value === 'isDirector'),
                    isLegalRepresentative: selectedOptions.some(opt => opt.value === 'isLegalRepresentative')
                  }));
                }}
                placeholder="Select roles..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button disabled={isSubmitting} onClick={() => { setIsAdding(false); setMissingFields([]); setError(""); }} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50">Cancel</button>
            <button disabled={isSubmitting} onClick={handleAddOwner} className="px-5 py-2.5 text-sm font-semibold bg-accent text-white hover:bg-accent/90 rounded-xl transition-colors shadow-sm disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Owner"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-auto mb-4 flex justify-between">
        <button
          onClick={goToPrevStep}
          disabled={isSubmitting}
          className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={isSubmitting || isAdding}
          className="px-8 py-3 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? "Saving..." : "Next"}
        </button>
      </div>
      
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
