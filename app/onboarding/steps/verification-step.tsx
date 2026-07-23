'use client'

import { useState, useRef } from 'react'
import { MdClose } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient, JsonValue } from '@/app/utils/api-client'
import { RcLookupResponseEnvelope } from '@/app/hooks/use-onboarding'
import FieldInput from '@/app/components/field-input'

interface VerificationStepProps {
    onVerified: (rc: string, id: string, status: string) => void
}

export default function VerificationStep({ onVerified }: VerificationStepProps) {
    const [rcNumber, setRcNumber] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)
    const [hoverBtn, setHoverBtn] = useState(false)

    const isValid = rcNumber.trim().length > 0

    const handleContinue = async () => {
        if (isPending) return
        const trimmed = rcNumber.trim()

        if (!trimmed) {
            setError("Please enter your RC or BC number.")
            return
        }

        setError(null)
        setIsPending(true)

        try {
            const res = (await apiClient("api/trading-partners/rc-number", {
                body: { rcNumber: trimmed } as Record<string, JsonValue>,
            })) as RcLookupResponseEnvelope

            if (res.hasErrors) {
                throw new Error(res.message || "Verification failed")
            }

            if (res.data.tradingPartnerStatus === "DocumentsUploaded") {
                setError("This RC number has already been onboarded.")
                setIsPending(false)
                return
            }

            onVerified(trimmed, res.data.tradingPartnerId, res.data.tradingPartnerStatus)
        } catch (err) {
            const message = err instanceof Error ? err.message : "Verification failed. Please try again."
            setError(message)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="flex flex-col max-w-[480px] mx-auto py-4">
            <AnimatePresence mode="wait">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3.5 mb-6 flex items-center gap-3 text-red-500 text-sm font-medium"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="shrink-0">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/10 rounded-lg transition-colors">
                            <MdClose size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
                Register your business
            </h1>
            <p className="text-sm text-muted-theme leading-relaxed mb-8">
                Enter your CAC-issued RC or BC number to look up and verify your business.
            </p>

            <div className="flex flex-col gap-1">
                <FieldInput 
                    placeholder="RC / BC Number *" 
                    value={rcNumber} 
                    onChange={v => { setRcNumber(v); setError(null) }}
                    maxLength={20}
                    description="Issued by the Corporate Affairs Commission"
                />
            </div>

            <button
                onClick={handleContinue}
                disabled={isPending || !isValid}
                onMouseEnter={() => setHoverBtn(true)}
                onMouseLeave={() => setHoverBtn(false)}
                className={`
                    w-full mt-8 py-4 px-6 rounded-xl text-sm font-bold text-white transition-all duration-200
                    flex items-center justify-center gap-3
                    ${isPending || !isValid 
                        ? 'bg-[#185fa5]/40 cursor-not-allowed' 
                        : 'bg-[#185fa5] hover:bg-[#15528e] hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98]'}
                `}
            >
                {isPending ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying…</span>
                    </div>
                ) : (
                    <>
                        <span>Continue</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </>
                )}
            </button>

            {error && (
                <button
                    onClick={() => onVerified(rcNumber, '', 'None')}
                    className="w-full mt-4 py-4 px-6 rounded-xl text-sm font-bold text-[#185fa5] bg-transparent border-2 border-[#185fa5] hover:bg-[#185fa5]/5 transition-all duration-200"
                >
                    Continue Manually
                </button>
            )}
        </div>
    )
}
