"use client";

import { useState, useMemo } from "react";
import { useOnboardingPartner } from "../../context/OnboardingContext";
import { useUpdateContactInfo, RegistrationInfo } from "@/app/hooks/use-onboarding";
import { MdOutlineEmail, MdOutlinePhone, MdOutlineLocationOn, MdOutlinePublic, MdOutlineMap, MdOutlineSignpost } from "react-icons/md";
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

const getSelectClassNames = (hasIcon: boolean, isMissing: boolean = false): ClassNamesConfig<OptionType> => ({
  control: (state) => 
    `w-full h-11 ${hasIcon ? 'pl-10' : ''} px-4 rounded-xl border ${
      isMissing ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500' : state.isFocused ? 'border-accent ring-1 ring-accent' : 'border-slate-200'
    } bg-white text-sm transition-colors cursor-pointer flex items-center`,
  menu: () => "mt-1 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50 text-sm",
  option: (state) => 
    `px-4 py-2 cursor-pointer text-sm ${
      state.isFocused ? 'bg-slate-50' : ''
    } ${state.isSelected ? 'bg-accent/10 text-accent font-medium' : 'text-slate-700'}`,
  singleValue: () => "text-slate-700",
  placeholder: () => "text-slate-400",
  valueContainer: () => "flex-1 flex items-center gap-1 overflow-hidden",
  dropdownIndicator: () => "p-2 text-slate-400 hover:text-slate-500",
  clearIndicator: () => "p-2 text-slate-400 hover:text-slate-500",
  indicatorSeparator: () => "hidden",
});

export default function Step2ContactInfo() {
  const { markStepCompleted, goToNextStep, goToPrevStep, companyId, registrationData, setRegistrationData } = useOnboardingPartner();
  const updateContactInfo = useUpdateContactInfo();

  const [formData, setFormData] = useState({
    businessEmail: registrationData?.businessEmail || "",
    streetAddress: registrationData?.streetAddress || "",
    country: registrationData?.country || "Nigeria",
    state: registrationData?.state || "",
    city: registrationData?.city || "",
    postalCode: registrationData?.postalCode || "",
    operatingStreetAddress: registrationData?.operatingStreetAddress || "",
    operatingCountry: registrationData?.operatingCountry || "Nigeria",
    operatingState: registrationData?.operatingState || "",
    operatingCity: registrationData?.operatingCity || "",
    operatingPostalCode: registrationData?.operatingPostalCode || "",
  });

  const [isOperatingSame, setIsOperatingSame] = useState(() => {
    if (registrationData?.operatingStreetAddress && registrationData.operatingStreetAddress !== registrationData.streetAddress) {
      return false;
    }
    return true;
  });

  const [phoneValue, setPhoneValue] = useState<string>(
    registrationData?.phoneCountryCode && registrationData?.phoneNumber 
      ? `${registrationData.phoneCountryCode}${registrationData.phoneNumber}`
      : ""
  );

  const [error, setError] = useState("");
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (missingFields.includes(name)) {
      setMissingFields(prev => prev.filter(f => f !== name));
    }
  };

  const getInputClassName = (fieldName: string, extraClasses: string = "") => {
    const isMissing = missingFields.includes(fieldName);
    return `w-full h-11 px-4 rounded-xl border ${isMissing ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-accent focus:ring-accent'} focus:outline-none focus:ring-1 transition-colors bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm ${extraClasses}`;
  };

  const getPhoneInputClassName = () => {
    const isMissing = missingFields.includes("phoneValue");
    return `w-full h-11 px-4 rounded-xl border ${isMissing ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500' : 'border-slate-200 dark:border-slate-600 focus-within:border-accent focus-within:ring-accent'} focus-within:ring-1 transition-colors bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm`;
  };

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

  const selectedOpCountryOption = countryOptions.find(o => o.value === formData.operatingCountry || o.isoCode === formData.operatingCountry) || null;
  const opCountryIsoCode = selectedOpCountryOption?.isoCode || '';

  const stateOptions = useMemo(() => {
    if (!countryIsoCode) return [];
    return State.getStatesOfCountry(countryIsoCode).map(s => ({
      value: s.name,
      isoCode: s.isoCode,
      label: s.name
    }));
  }, [countryIsoCode]);

  const opStateOptions = useMemo(() => {
    if (!opCountryIsoCode) return [];
    return State.getStatesOfCountry(opCountryIsoCode).map(s => ({
      value: s.name,
      isoCode: s.isoCode,
      label: s.name
    }));
  }, [opCountryIsoCode]);

  const selectedStateOption = stateOptions.find(o => o.value === formData.state || o.isoCode === formData.state) || null;
  const stateIsoCode = selectedStateOption?.isoCode || '';

  const selectedOpStateOption = opStateOptions.find(o => o.value === formData.operatingState || o.isoCode === formData.operatingState) || null;
  const opStateIsoCode = selectedOpStateOption?.isoCode || '';

  const cityOptions = useMemo(() => {
    if (!countryIsoCode || !stateIsoCode) return [];
    return City.getCitiesOfState(countryIsoCode, stateIsoCode).map(c => ({
      value: c.name,
      label: c.name
    }));
  }, [countryIsoCode, stateIsoCode]);

  const opCityOptions = useMemo(() => {
    if (!opCountryIsoCode || !opStateIsoCode) return [];
    return City.getCitiesOfState(opCountryIsoCode, opStateIsoCode).map(c => ({
      value: c.name,
      label: c.name
    }));
  }, [opCountryIsoCode, opStateIsoCode]);

  const selectedCityOption = cityOptions.find(o => o.value === formData.city) || null;
  const selectedOpCityOption = opCityOptions.find(o => o.value === formData.operatingCity) || null;

  const handleCountryChange = (
    newValue: SingleValue<OptionType> | MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>,
    isOperating = false
  ) => {
    const selectedOption = newValue as SingleValue<OptionType>;
    if (isOperating) {
      setFormData({ ...formData, operatingCountry: selectedOption?.value || "", operatingState: "", operatingCity: "" });
      setMissingFields(prev => prev.filter(f => !["operatingCountry", "operatingState", "operatingCity"].includes(f)));
    } else {
      setFormData({ ...formData, country: selectedOption?.value || "", state: "", city: "" });
      setMissingFields(prev => prev.filter(f => !["country", "state", "city"].includes(f)));
    }
  };

  const handleStateChange = (
    newValue: SingleValue<OptionType> | MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>,
    isOperating = false
  ) => {
    const selectedOption = newValue as SingleValue<OptionType>;
    if (isOperating) {
      setFormData({ ...formData, operatingState: selectedOption?.value || "", operatingCity: "" });
      setMissingFields(prev => prev.filter(f => !["operatingState", "operatingCity"].includes(f)));
    } else {
      setFormData({ ...formData, state: selectedOption?.value || "", city: "" });
      setMissingFields(prev => prev.filter(f => !["state", "city"].includes(f)));
    }
  };

  const handleCityChange = (
    newValue: SingleValue<OptionType> | MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>,
    isOperating = false
  ) => {
    const selectedOption = newValue as SingleValue<OptionType>;
    if (isOperating) {
      setFormData({ ...formData, operatingCity: selectedOption?.value || "" });
      if (missingFields.includes("operatingCity")) setMissingFields(prev => prev.filter(f => f !== "operatingCity"));
    } else {
      setFormData({ ...formData, city: selectedOption?.value || "" });
      if (missingFields.includes("city")) setMissingFields(prev => prev.filter(f => f !== "city"));
    }
  };

  const handleNext = async () => {
    if (!companyId) {
      setError("Company ID is missing. Please start again.");
      return;
    }

    const newMissingFields: string[] = [];
    if (!formData.businessEmail) newMissingFields.push("businessEmail");
    if (!phoneValue) newMissingFields.push("phoneValue");
    if (!formData.streetAddress) newMissingFields.push("streetAddress");
    if (!formData.country) newMissingFields.push("country");
    if (!formData.state) newMissingFields.push("state");
    if (!formData.city) newMissingFields.push("city");
    if (!formData.postalCode) newMissingFields.push("postalCode");

    if (!isOperatingSame) {
      if (!formData.operatingStreetAddress) newMissingFields.push("operatingStreetAddress");
      if (!formData.operatingCountry) newMissingFields.push("operatingCountry");
      if (!formData.operatingState) newMissingFields.push("operatingState");
      if (!formData.operatingCity) newMissingFields.push("operatingCity");
      if (!formData.operatingPostalCode) newMissingFields.push("operatingPostalCode");
    }

    if (newMissingFields.length > 0) {
      setMissingFields(newMissingFields);
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setError("");
      
      let phoneCountryCode = "";
      let phoneNumber = "";
      
      if (phoneValue) {
        const parsed = parsePhoneNumber(phoneValue);
        if (parsed) {
          phoneCountryCode = `+${parsed.countryCallingCode}`;
          phoneNumber = parsed.nationalNumber as string;
        }
      }

      let operatingFields = {};
      if (isOperatingSame) {
        operatingFields = {
          operatingStreetAddress: formData.streetAddress,
          operatingCountry: formData.country,
          operatingState: formData.state,
          operatingCity: formData.city,
          operatingPostalCode: formData.postalCode,
        };
      } else {
        operatingFields = {
          operatingStreetAddress: formData.operatingStreetAddress,
          operatingCountry: formData.operatingCountry,
          operatingState: formData.operatingState,
          operatingCity: formData.operatingCity,
          operatingPostalCode: formData.operatingPostalCode,
        };
      }

      const payload = {
        ...formData,
        ...operatingFields,
        phoneCountryCode,
        phoneNumber,
      };

      const data = await updateContactInfo.mutateAsync({
        companyId,
        payload,
      });
      setRegistrationData((prev) => 
        prev ? { ...prev, ...(data as unknown as Partial<RegistrationInfo>) } as RegistrationInfo : prev
      );

      markStepCompleted(2);
      goToNextStep();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update contact info. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mt-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Contact Information</h2>
        <p className="text-slate-500 text-sm">Please provide your contact details so we can reach out to you.</p>
      </div>

      {error && (
        <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-5 flex-1">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Business Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdOutlineEmail className="text-slate-400" />
            </div>
            <input
              type="email"
              name="businessEmail"
              value={formData.businessEmail}
              onChange={handleChange}
              placeholder="e.g. contact@company.com"
              className={getInputClassName("businessEmail", "pl-10")}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
          <PhoneInput
            international
            defaultCountry="NG"
            value={phoneValue}
            onChange={(val) => {
              setPhoneValue(val as string);
              if (missingFields.includes("phoneValue")) setMissingFields(prev => prev.filter(f => f !== "phoneValue"));
            }}
            className={getPhoneInputClassName()}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Registered Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdOutlineLocationOn className="text-slate-400" />
            </div>
            <input
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleChange}
              placeholder="e.g. 123 Business Road"
              className={getInputClassName("streetAddress", "pl-10")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Country</label>
            <div className="relative">
              <Select
                unstyled
                classNames={getSelectClassNames(false, missingFields.includes("country"))}
                options={countryOptions}
                value={selectedCountryOption}
                onChange={handleCountryChange}
                placeholder="Select Country"
                isClearable
                isSearchable
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">State/Province</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <MdOutlineMap className="text-slate-400" />
              </div>
              <Select
                unstyled
                classNames={getSelectClassNames(true, missingFields.includes("state"))}
                options={stateOptions}
                value={selectedStateOption}
                onChange={handleStateChange}
                placeholder={countryIsoCode ? "Select State" : "Select Country first"}
                isDisabled={!countryIsoCode}
                isClearable
                isSearchable
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">City</label>
            <Select
              unstyled
              classNames={getSelectClassNames(false, missingFields.includes("city"))}
              options={cityOptions}
              value={selectedCityOption}
              onChange={handleCityChange}
              placeholder={stateIsoCode ? "Select City" : "Select State first"}
              isDisabled={!stateIsoCode}
              isClearable
              isSearchable
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Postal Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdOutlineSignpost className="text-slate-400" />
              </div>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="e.g. 100001"
                className={getInputClassName("postalCode", "pl-10")}
              />
            </div>
          </div>
        </div>

        {/* Operating Address Section */}
        <div className="pt-6 border-t border-slate-200 mt-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Is Business Operating Address same as Registered Address?
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOperatingSame(true)}
                className={`px-6 py-2 rounded-lg border text-sm font-bold transition-all ${
                  isOperatingSame
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setIsOperatingSame(false)}
                className={`px-6 py-2 rounded-lg border text-sm font-bold transition-all ${
                  !isOperatingSame
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {!isOperatingSame && (
            <div className="space-y-5 animate-in slide-in-from-top-2 fade-in duration-300">
              <h3 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">Operating Address</h3>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Operating Street Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdOutlineLocationOn className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="operatingStreetAddress"
                    value={formData.operatingStreetAddress}
                    onChange={handleChange}
                    placeholder="e.g. 456 Operating Road"
                    className={getInputClassName("operatingStreetAddress", "pl-10")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Operating Country</label>
                  <div className="relative">
                    <Select
                      unstyled
                      classNames={getSelectClassNames(false, missingFields.includes("operatingCountry"))}
                      options={countryOptions}
                      value={selectedOpCountryOption}
                      onChange={(val, meta) => handleCountryChange(val, meta, true)}
                      placeholder="Select Country"
                      isClearable
                      isSearchable
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Operating State/Prov</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <MdOutlineMap className="text-slate-400" />
                    </div>
                    <Select
                      unstyled
                      classNames={getSelectClassNames(true, missingFields.includes("operatingState"))}
                      options={opStateOptions}
                      value={selectedOpStateOption}
                      onChange={(val, meta) => handleStateChange(val, meta, true)}
                      placeholder={opCountryIsoCode ? "Select State" : "Select Country first"}
                      isDisabled={!opCountryIsoCode}
                      isClearable
                      isSearchable
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Operating City</label>
                  <Select
                    unstyled
                    classNames={getSelectClassNames(false, missingFields.includes("operatingCity"))}
                    options={opCityOptions}
                    value={selectedOpCityOption}
                    onChange={(val, meta) => handleCityChange(val, meta, true)}
                    placeholder={opStateIsoCode ? "Select City" : "Select State first"}
                    isDisabled={!opStateIsoCode}
                    isClearable
                    isSearchable
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Operating Postal Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MdOutlineSignpost className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="operatingPostalCode"
                      value={formData.operatingPostalCode}
                      onChange={handleChange}
                      placeholder="e.g. 100002"
                      className={getInputClassName("operatingPostalCode", "pl-10")}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 mb-4 flex justify-between">
        <button
          onClick={goToPrevStep}
          disabled={updateContactInfo.isPending}
          className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={updateContactInfo.isPending}
          className="px-8 py-3 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-95 disabled:opacity-50"
        >
          {updateContactInfo.isPending ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
}
