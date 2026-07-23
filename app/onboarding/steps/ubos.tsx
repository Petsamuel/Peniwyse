'use client'

import { useState } from 'react'
import FieldInput from '@/app/components/field-input'
import FieldSelect from '@/app/components/field-select'
import { NavButtons } from '../nav-buttons'
import { type UBO, TITLES, COUNTRIES } from '../type'
import { useCreateUBO, useGetUBOs } from '@/app/hooks/use-onboarding'
import { getApiErrorMessage } from '@/app/utils/error-message'

const empty = (): UBO => ({ title: '', fullName: '', address: '', shareholding: '', nationality: '' })

// ─── CHILD COMPONENT: Handles Form State ───
function UBOsForm({ 
    tradingPartnerId, 
    initialData, 
    onPrev, 
    onNext 
}: { 
    tradingPartnerId: string, 
    initialData: UBO[], 
    onPrev: () => void, 
    onNext: () => void 
}) {
    const [list, setList] = useState<UBO[]>(initialData.length > 0 ? initialData : [empty()])
    const { mutate, isPending } = useCreateUBO()
     const [error, setError] = useState<string | null>(null)

    const update = (i: number, k: keyof UBO, v: string) => 
        setList(p => p.map((x, j) => j === i ? { ...x, [k]: v } : x))

    // Requirement: All fields mandatory AND shareholding must be >= 5%
    const isFormValid = list.every(ubo => {
        const shareVal = parseFloat(ubo.shareholding);
        return (
            ubo.title !== '' &&
            ubo.fullName.trim() !== '' &&
            ubo.address.trim() !== '' &&
            !isNaN(shareVal) && 
            shareVal >= 5 && // Compliance Rule: Min 5%
            ubo.nationality !== ''
        );
    })

    const handleNext = () => {
        if (!isFormValid) return

        mutate({
            tradingPartnerId,
            ultimateBeneficialOwners: list.map(ubo => ({
                title: ubo.title,
                fullname: ubo.fullName,
                address: ubo.address,
                shareholding: parseFloat(ubo.shareholding) || 0,
                nationality: ubo.nationality,
            })),
        }, { onSuccess: onNext, onError: (err: unknown) => setError(getApiErrorMessage(err))  })
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">Ultimate Beneficial Owners (UBO)</h2>
                    <p className="text-[10px] text-muted-theme font-semibold uppercase tracking-wider">Beneficial owners with 5% or more shareholding are mandatory.</p>
                </div>
                <button 
                    type="button"
                    onClick={() => setList(p => [...p, empty()])} 
                    className="flex items-center gap-2 text-[11px] font-bold text-[#185fa5] border border-[#185fa5] rounded-xl px-4 py-2 hover:bg-blue-50 transition-all uppercase tracking-wide"
                >
                    <span className="text-lg leading-none">+</span> Add More
                </button>
            </div>

            <div className="flex flex-col gap-10">
                {list.map((ubo, i) => {
                    const shareVal = parseFloat(ubo.shareholding);
                    const isShareTooLow = ubo.shareholding !== '' && !isNaN(shareVal) && shareVal < 5;

                    return (
                        <div key={i} className="relative">
                            {i > 0 && (
                                <div className="flex items-center justify-between mb-4 bg-surface-hover p-2 rounded-lg">
                                    <span className="text-[10px] font-black uppercase text-muted-theme tracking-widest">Entry #{i + 1}</span>
                                    <button 
                                        type="button"
                                        onClick={() => setList(p => p.filter((_, j) => j !== i))}
                                        className="text-xs font-bold text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Requirement: Added Asterisks (*) to indicate mandatory fields */}
                                <FieldSelect placeholder="Title *" value={ubo.title} onChange={v => update(i, 'title', v)} options={TITLES} />
                                <FieldInput placeholder="Full Name *" value={ubo.fullName} onChange={v => update(i, 'fullName', v)} />
                                <FieldInput placeholder="Residential Address *" value={ubo.address} onChange={v => update(i, 'address', v)} />
                                
                                <div className="flex flex-col gap-1">
                                    <FieldInput 
                                        placeholder="Shareholding (%) *" 
                                        value={ubo.shareholding} 
                                        isNumeric={true} 
                                        maxLength={3} 
                                        onChange={v => update(i, 'shareholding', v)} 
                                    />
                                    {/* Requirement: Real-time feedback for the 5% rule */}
                                    {isShareTooLow && (
                                        <p className="text-[10px] text-red-500 font-bold animate-pulse ml-1">
                                            Compliance Rule: Minimum 5% shareholding required.
                                        </p>
                                    )}
                                </div>
                                
                                <div className="md:col-span-2">
                                    <FieldSelect placeholder="Nationality *" value={ubo.nationality} onChange={v => update(i, 'nationality', v)} options={COUNTRIES} />
                                </div>
                            </div>
                            {i < list.length - 1 && <div className="border-t border-border-theme mt-10" />}
                        </div>
                    );
                })}
            </div>

            {error && <p className="text-xs text-red-500 mt-6 font-bold uppercase tracking-wide">{error}</p>}

            <NavButtons 
                onPrev={onPrev} 
                onNext={handleNext} 
                disabled={isPending || !isFormValid} 
                isLoading={isPending} 
            />
        </div>
    )
}

export default function UBOsStep({ tradingPartnerId, onPrev, onNext }: { tradingPartnerId: string; onPrev: () => void; onNext: () => void }) {
    const { data: existing, isLoading } = useGetUBOs(tradingPartnerId)

    if (isLoading) return <div className="py-20 text-center text-sm text-muted-theme font-medium">Loading saved owners...</div>

    const initialData = (existing ?? []).map(u => ({
        title: u.title || '',
        fullName: u.fullname || '',
        address: u.address || '',
        shareholding: u.shareholding ? String(u.shareholding) : '',
        nationality: u.nationality || '',
    }))

    return (
        <UBOsForm 
            key={tradingPartnerId}
            tradingPartnerId={tradingPartnerId} 
            initialData={initialData} 
            onPrev={onPrev} 
            onNext={onNext} 
        />
    )
}