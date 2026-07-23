'use client'

import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import StepperDots from '../components/stepper-dots'
import EntityInfoStep from './steps/entity-info'
import UBOsStep from './steps/ubos'
import ShareholdersStep from './steps/shareholders'
import DirectorsStep from './steps/directors'
import ContactDeclarationStep from './steps/contact-declaration'
import RecipientDetailsStep from './steps/recipient-details'
import CddQuestionnaire from './cdd-questionnaire'
import DocumentsTab from './documents-tab'

import { MdAccountCircle } from 'react-icons/md'
import VerificationStep from './steps/verification-step'


const ONBOARDING_SUB_STEPS = [
    'Verification', 'Entity Info', 'UBOs', 'Shareholders', 'Directors', 'Contact & Declaration'
]

const STATUS_TO_STEP: Record<string, number> = {
    None: 0, EntityInfo: 2, UBO: 3,
    EntityShareholder: 4, Director: 5,
    OnboardingCompleted: 6, RecipientDetailsCompleted: 7, QuestionnaireCompleted: 8,
}


const STEP_QUERY_KEYS: Record<number, (id: string) => unknown[]> = {
    1: (id) => ['trading-partner', id],
    2: (id) => ['ubos', id],
    3: (id) => ['shareholders', id],
    4: (id) => ['directors', id],
    5: (id) => ['contact-declaration', id],
}

export default function EntityOnboarding({
    tradingPartnerId: initialId,
    initialStatus = 'None',
    onComplete
}: {
    tradingPartnerId: string;
    initialStatus?: string;
    onComplete: () => void
}) {
    const [tradingPartnerId, setTradingPartnerId] = useState(initialId)
    const [step, setStep] = useState(() => {
        const baseStep = STATUS_TO_STEP[initialStatus] ?? 0
        // If we have an ID but status is None, we should probably be at Entity Info (Step 1)
        if (initialId && baseStep === 0) return 1
        return baseStep
    })
    const queryClient = useQueryClient()

    const goToStep = (targetStep: number) => {
        const queryKeyFn = STEP_QUERY_KEYS[targetStep]
        if (queryKeyFn && tradingPartnerId) {
            // Invalidate so the target step re-fetches fresh data on mount
            queryClient.invalidateQueries({ queryKey: queryKeyFn(tradingPartnerId) })
        }
        setStep(targetStep)
    }

    const activeTabId = useMemo(() => {
        if (step <= 5) return 'onboarding'
        if (step === 6) return 'recipient'
        if (step === 7) return 'questionnaire'
        return 'documents'
    }, [step])

    const tabs = [
        { id: 'onboarding', label: 'Entity Onboarding', startStep: 0 },
        { id: 'recipient', label: 'Recipient Details', startStep: 6 },
        { id: 'questionnaire', label: 'CDD Questionnaire', startStep: 7 },
        { id: 'documents', label: 'Documents', startStep: 8 },
    ]

    return (
        <div className="max-w-240 mx-auto w-full py-4 px-4 flex flex-col gap-8">
            <div className="flex items-center gap-10 border-b border-border-theme pb-px">
                {tabs.map((tab) => {
                    const isActive = activeTabId === tab.id
                    const isLocked = step < tab.startStep && activeTabId !== tab.id

                    return (
                        <button
                            key={tab.id}
                            disabled={isLocked}
                            onClick={() => goToStep(tab.startStep)}
                            className={`relative pb-4 text-sm font-semibold transition-all ${
                                isActive
                                    ? 'text-accent cursor-default'
                                    : isLocked
                                    ? 'text-muted-theme/30 cursor-not-allowed'
                                    : 'text-muted-theme hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTabUnderline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                                />
                            )}
                        </button>
                    )
                })}
            </div>


            <div className="relative">
                <div className="bg-card-bg rounded-[16px] shadow-sm border border-border-theme transition-all duration-300">
                    {activeTabId === 'onboarding' && (
                        <div className="relative h-28 flex items-center justify-center bg-gradient-to-r from-[#185fa5] to-[#124a82] border-b border-white/10 rounded-t-[16px] overflow-hidden">
                            {/* Custom Noise Pattern Overlay */}
                            <div 
                                className="absolute inset-0 opacity-[0.1] mix-blend-overlay pointer-events-none" 
                                style={{ backgroundImage: 'url(/patterns.png)', backgroundRepeat: 'repeat' }} 
                            />
                            <div className="relative z-10 w-full px-10">
                                <StepperDots steps={ONBOARDING_SUB_STEPS} currentStep={step} />
                            </div>
                        </div>
                    )}
                    
                    <div className="pb-10 px-10 pt-8" key={`${tradingPartnerId}-step-${step}`}>
                        {step === 0 && (
                            <VerificationStep 
                                onVerified={(rc, id, status) => {
                                    setTradingPartnerId(id)
                                    setStep(1)
                                }} 
                            />
                        )}
                        {step === 1 && <EntityInfoStep tradingPartnerId={tradingPartnerId} onNext={(newId?: string) => {
                            if (newId && typeof newId === 'string' && newId !== tradingPartnerId) {
                                setTradingPartnerId(newId)
                            }
                            goToStep(2)
                        }} />}
                        {step === 2 && <UBOsStep tradingPartnerId={tradingPartnerId} onPrev={() => goToStep(1)} onNext={() => goToStep(3)} />}
                        {step === 3 && <ShareholdersStep tradingPartnerId={tradingPartnerId} onPrev={() => goToStep(2)} onNext={() => goToStep(4)} />}
                        {step === 4 && <DirectorsStep tradingPartnerId={tradingPartnerId} onPrev={() => goToStep(3)} onNext={() => goToStep(5)} />}
                        {step === 5 && <ContactDeclarationStep tradingPartnerId={tradingPartnerId} onPrev={() => goToStep(4)} onNext={() => goToStep(6)} />}
                        {step === 6 && <RecipientDetailsStep tradingPartnerId={tradingPartnerId} onPrev={() => goToStep(5)} onNext={() => goToStep(7)} />}
                        {step === 7 && <CddQuestionnaire tradingPartnerId={tradingPartnerId} onNext={() => goToStep(8)} />}
                        {step === 8 && <DocumentsTab tradingPartnerId={tradingPartnerId} onSubmit={onComplete} />}
                    </div>
                </div>
            </div>
        </div>
    )
}