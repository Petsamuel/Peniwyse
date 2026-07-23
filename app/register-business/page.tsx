'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterBusinessPage() {
    const router = useRouter()
    const [rcNumber, setRcNumber] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    const handleContinue = async () => {
        const trimmed = rcNumber.trim()
        if (!trimmed) {
            setError('Please enter your RC or BC number.')
            return
        }

        setError(null)
        setIsPending(true)

        try {
            // TODO: replace with real API call to validate RC number
            await new Promise(res => setTimeout(res, 400))
            router.replace('/partners')
        } catch {
            setError('This business already exist.')
        } finally {
            setIsPending(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleContinue()
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-4"
            style={{
                backgroundColor: '#EBEBEB',
                backgroundImage: `repeating-linear-gradient(
                    120deg,
                    transparent,
                    transparent 18px,
                    rgba(255,255,255,0.45) 18px,
                    rgba(255,255,255,0.45) 36px
                )`,
            }}
        >
            {/* Title */}
            <h1 className="text-3xl font-bold text-foreground mb-6 tracking-tight">
                Peniwyse Finance
            </h1>

            {/* Card */}
            <div className="w-full max-w-md bg-card-bg rounded-2xl shadow-md overflow-hidden">
                {/* Pink header banner */}
                <div
                    className="px-8 py-6 text-center"
                    // style={{ background: 'linear-gradient(135deg, #EC407A 0%, #C2185B 100%)' }}
                >
                    <h2 className="text-lg font-bold text-white mb-1">Register your business</h2>
                    <p className="text-sm text-pink-100 leading-relaxed">
                        We require a unique RC or BC number for each business
                        registration. Please enter your valid RC Number to proceed
                    </p>
                </div>

                {/* Form body */}
                <form onSubmit={handleContinue}>
                <div className="px-8 py-8 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <input
                            type="text"
                            value={rcNumber}
                            onChange={e => { setRcNumber(e.target.value); setError(null) }}
                            onKeyDown={handleKeyDown}
                            placeholder="RC 1234567"
                            className={`w-full text-sm text-foreground placeholder-[#7B809A] outline-none border rounded-lg px-4 py-3 transition-colors ${
                                error
                                    ? 'border-[#EC407A] focus:border-[#EC407A]'
                                    : 'border-border-theme focus:border-gray-400'
                            }`}
                        />
                        {error && (
                            <p className="text-sm text-[#EC407A] mt-0.5 px-1">{error}</p>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <button
                            // onClick={handleContinue}
                            disabled={isPending || !rcNumber.trim()}
                            className="px-10 py-2.5 bg-[#344767] text-white text-sm font-semibold rounded-lg hover:bg-[#2c3a58] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPending ? 'Checking…' : 'Continue'}
                        </button>
                    </div>
                </div>
                </form>
            </div>
        </div>
    )
}
