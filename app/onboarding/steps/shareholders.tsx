'use client'

import { useState } from 'react'
import FieldInput from '@/app/components/field-input'
import { NavButtons } from '../nav-buttons'
import { useCreateShareholder, useGetShareholders } from '@/app/hooks/use-onboarding'
import { getApiErrorMessage } from '@/app/utils/error-message'

interface UIShareholder {
    name: string
    address: string
    shareholding: string
}

const empty = (): UIShareholder => ({ name: '', address: '', shareholding: '' })

// ─── CHILD COMPONENT: Form Logic ───
function ShareholdersForm({ 
    tradingPartnerId, 
    initialData, 
    onPrev, 
    onNext 
}: { 
    tradingPartnerId: string, 
    initialData: UIShareholder[], 
    onPrev: () => void, 
    onNext: () => void 
}) {
    const [list, setList] = useState<UIShareholder[]>(initialData.length > 0 ? initialData : [empty()])
    const { mutate, isPending } = useCreateShareholder()
    const [error, setError] = useState<string | null>(null)

    const update = (i: number, k: keyof UIShareholder, v: string) => 
        setList(p => p.map((x, j) => j === i ? { ...x, [k]: v } : x))

    // Requirement: All fields mandatory AND shareholding must be >= 25%
    const isFormValid = list.every(sh => {
        const shareVal = parseFloat(sh.shareholding);
        return (
            sh.name.trim() !== '' && 
            sh.address.trim() !== '' && 
            !isNaN(shareVal) && 
            shareVal >= 25 
        );
    })

    const handleNext = () => {
        if (!isFormValid) return;
        
        mutate({
            tradingPartnerId,
            tradingPartnerShareholders: list.map(sh => ({
                name: sh.name,
                address: sh.address,
                shareholding: parseFloat(sh.shareholding) || 0,
            })),
        }, { onSuccess: onNext, onError: (err: unknown) => setError(getApiErrorMessage(err))  })
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">Entity Shareholders</h2>
                    <p className="text-[10px] text-muted-theme font-semibold uppercase tracking-wider">Entity shareholders with 25% or more shareholding are mandatory.</p>
                </div>
                <button 
                    type="button"
                    onClick={() => setList(p => [...p, empty()])} 
                    className="flex items-center gap-2 text-[11px] font-bold text-[#185fa5] border border-[#185fa5] rounded-xl px-4 py-2 hover:bg-blue-50 transition-all uppercase tracking-wide"
                >
                    <span className="text-lg leading-none">+</span> Add New Entity
                </button>
            </div>

            <div className="flex flex-col gap-10">
                {list.map((sh, i) => {
                    const shareVal = parseFloat(sh.shareholding);
                    const isShareTooLow = sh.shareholding !== '' && !isNaN(shareVal) && shareVal < 25;

                    return (
                        <div key={i} className="relative">
                            {i > 0 && (
                                <div className="flex items-center justify-between mb-4 bg-surface-hover p-2 rounded-lg">
                                    <span className="text-[10px] font-black uppercase text-muted-theme tracking-widest">Shareholder #{i + 1}</span>
                                    <button 
                                        type="button"
                                        onClick={() => setList(p => p.filter((_, j) => j !== i))} 
                                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                            <div className="flex flex-col gap-5">
                                <FieldInput placeholder="Shareholder Name *" value={sh.name} onChange={v => update(i, 'name', v)} />
                                
                                <div className="flex flex-col gap-1">
                                    <FieldInput 
                                        placeholder="Shareholding (%) *" 
                                        value={sh.shareholding} 
                                        isNumeric={true} 
                                        maxLength={3} 
                                        onChange={v => update(i, 'shareholding', v)} 
                                    />
                                    {/* Requirement: Compliance Feedback */}
                                    {isShareTooLow && (
                                        <p className="text-[10px] text-red-500 font-bold animate-pulse ml-1">
                                            Compliance Rule: Minimum 25% shareholding required.
                                        </p>
                                    )}
                                </div>
                                
                                <FieldInput placeholder="Address *" value={sh.address} onChange={v => update(i, 'address', v)} />
                            </div>
                            {i < list.length - 1 && <div className="border-t border-border-theme mt-10" />}
                        </div>
                    );
                })}
            </div>

            {error && <p className="text-xs text-red-500 mt-6 font-bold uppercase tracking-wide">{error}</p>}

            <NavButtons onPrev={onPrev} onNext={handleNext} disabled={isPending || !isFormValid} isLoading={isPending} />
        </div>
    )
}

// ─── PARENT COMPONENT: Data Loader ───
export default function ShareholdersStep({ tradingPartnerId, onPrev, onNext }: { tradingPartnerId: string; onPrev: () => void; onNext: () => void }) {
    const { data: existing, isLoading } = useGetShareholders(tradingPartnerId)

    if (isLoading) return <div className="py-20 text-center text-sm text-muted-theme font-medium">Loading saved Shareholders...</div>

    const initialData: UIShareholder[] = (existing ?? []).map((u) => ({
        name: u.name || '',
        address: u.address || '',
        shareholding: u.shareholding ? String(u.shareholding) : ''
    }))
   
    return (
        <ShareholdersForm 
            key={tradingPartnerId} 
            tradingPartnerId={tradingPartnerId} 
            initialData={initialData} 
            onPrev={onPrev} 
            onNext={onNext}
        />
    )
}