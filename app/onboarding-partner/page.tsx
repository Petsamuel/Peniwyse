"use client";

import { useOnboardingPartner } from "./context/OnboardingContext";
import Step0FindCompany from "./components/steps/Step0FindCompany";
import Step1BasicInfo from "./components/steps/Step1BasicInfo";
import Step2ContactInfo from "./components/steps/Step2ContactInfo";
import Step3AdditionalDetails from "./components/steps/Step3AdditionalDetails";
import Step4BeneficialOwners from "./components/steps/Step4BeneficialOwners";
import Step5DocumentsUpload from "./components/steps/Step5DocumentsUpload";
import Step6ReviewSubmit from "./components/steps/Step6ReviewSubmit";

export default function OnboardingPartnerPage() {
  const { currentStep } = useOnboardingPartner();

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step0FindCompany />;
      case 1:
        return <Step1BasicInfo />;
      case 2:
        return <Step2ContactInfo />;
      case 3:
        return <Step3AdditionalDetails />;
      case 4:
        return <Step4BeneficialOwners />;
      case 5:
        return <Step5DocumentsUpload />;
      case 6:
        return <Step6ReviewSubmit />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full">
      {renderStep()}
    </div>
  );
}
