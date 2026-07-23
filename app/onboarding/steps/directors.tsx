'use client'

import { useState } from 'react'
import FieldInput from '@/app/components/field-input'
import FieldSelect from '@/app/components/field-select'
import { NavButtons } from '../nav-buttons'
import { type Director, TITLES, COUNTRIES } from '../type'
import { useCreateDirector, useGetDirectors } from '@/app/hooks/use-onboarding'
import DatePicker from '@/app/components/date-picker'
import { getApiErrorMessage } from '@/app/utils/error-message'



const empty = (): Director => ({ 
    title: '', 
    fullname: '', 
    address: '', 
    dateOfBirth: '', 
    nationality: '', 
})

// ─── CHILD COMPONENT: Form Logic ───
function DirectorsForm({ 
    tradingPartnerId, 
    initialData, 
    onPrev, 
    onNext 
}: { 
    tradingPartnerId: string, 
    initialData: Director[], 
    onPrev: () => void, 
    onNext: () => void 
}) {
    const [list, setList] = useState<Director[]>(initialData.length > 0 ? initialData : [empty()])
    const [error, setError] = useState<string | null>(null)
    const { mutate, isPending } = useCreateDirector()

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const update = (i: number, k: keyof Director, v: string) => 
        setList(p => p.map((x, j) => j === i ? { ...x, [k]: v } : x))

    // Requirement 1 & 4: All fields mandatory + Valid Email
    const isFormValid = list.every(d => 
        d.title !== '' &&
        d.fullname.trim() !== '' &&
        d.address.trim() !== '' &&
        d.dateOfBirth !== '' &&
        d.nationality !== '' 
    )

    const handleNext = () => {
        setError(null)
        mutate({
            tradingPartnerId,
            businessDirectors: list.map(dir => ({
                title: dir.title,
                fullname: dir.fullname,
                address: dir.address,
                dateOfBirth: dir.dateOfBirth,
                nationality: dir.nationality,
            })),
        }, { 
            onSuccess: onNext,
            onError: (err: unknown) => setError(getApiErrorMessage(err)) 
        })
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">Business Directors</h2>
                    <p className="text-[10px] text-muted-theme font-semibold uppercase tracking-wider">Provide details for all directors on the board.</p>
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
                {list.map((dir, i) => (
                    <div key={i} className="relative">
                        {i > 0 && (
                            <div className="flex items-center justify-between mb-4 bg-surface-hover p-2 rounded-lg">
                                <span className="text-[10px] font-black uppercase text-muted-theme tracking-widest">Director #{i + 1}</span>
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
                            <FieldSelect placeholder="Title *" value={dir.title} onChange={v => update(i, 'title', v)} options={TITLES} />
                            <FieldInput placeholder="Full Name *" value={dir.fullname} onChange={v => update(i, 'fullname', v)} />
                            
                            

                            <FieldInput placeholder="Residential Address *" value={dir.address} onChange={v => update(i, 'address', v)} />
                            
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-muted-theme uppercase font-bold ml-1">Date of Birth *</label>
                                <DatePicker 
                                    value={dir.dateOfBirth} 
                                    placeholder="Select Birth Date"
                                    onChange={v => update(i, 'dateOfBirth', v)} 
                                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                                />
                            </div>

                            <FieldSelect placeholder="Nationality *" value={dir.nationality} onChange={v => update(i, 'nationality', v)} options={COUNTRIES} />
                        </div>
                        {i < list.length - 1 && <div className="border-t border-border-theme mt-10" />}
                    </div>
                ))}
            </div>

            {error && <p className="text-xs text-red-500 mt-4 font-bold uppercase tracking-wide">{error}</p>}
            
            <NavButtons 
                onPrev={onPrev} 
                onNext={handleNext} 
                disabled={isPending || !isFormValid} 
                isLoading={isPending} 
            />
        </div>
    )
}

// ─── PARENT COMPONENT: Data Loader ───
export default function DirectorsStep({ tradingPartnerId, onPrev, onNext }: { tradingPartnerId: string; onPrev: () => void; onNext: () => void }) {
    const { data: existing, isLoading } = useGetDirectors(tradingPartnerId)

    if (isLoading) return <div className="py-20 text-center text-sm text-muted-theme font-medium">Loading saved Directors...</div>

    const initialData: Director[] = (existing ?? []).map(d => ({
        title: d.title || '',
        fullname: d.fullname || '',
        address: d.address || '',
        dateOfBirth: d.dateOfBirth || '',
        nationality: d.nationality || '',
    }))

    return (
        <DirectorsForm 
            key={tradingPartnerId} 
            tradingPartnerId={tradingPartnerId} 
            initialData={initialData} 
            onPrev={onPrev} 
            onNext={onNext} 
        />
    )
}