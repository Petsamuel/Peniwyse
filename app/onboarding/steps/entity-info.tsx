'use client'

import { useState } from 'react'
import FieldInput from '@/app/components/field-input'
import FieldSelect from '@/app/components/field-select'
import { NavButtons } from '../nav-buttons'
import { type EntityInfo, ENTITY_TYPES, SECTORS, COUNTRIES } from '../type'
import { useCreateTradingPartner, useGetTradingPartner } from '@/app/hooks/use-onboarding'
import { getApiErrorMessage } from '@/app/utils/error-message'

function EntityInfoForm({ 
    tradingPartnerId, 
    initialData, 
    onNext 
}: { 
    tradingPartnerId: string, 
    initialData: EntityInfo, 
    onNext: (id?: string) => void 
}) {
    const isStandardType = ENTITY_TYPES.includes(initialData.entityType) || initialData.entityType === '';
    const isStandardSector = SECTORS.includes(initialData.sector) || initialData.sector === '';

    const [data, setData] = useState<EntityInfo>({
        ...initialData,
        entityType: isStandardType ? initialData.entityType : 'Other',
        sector: isStandardSector ? initialData.sector : 'Other'
    })

    const [customEntityType, setCustomEntityType] = useState(isStandardType ? '' : initialData.entityType)
    const [customSector, setCustomSector] = useState(isStandardSector ? '' : initialData.sector)
    
    const [error, setError] = useState<string | null>(null)
    const { mutate, isPending } = useCreateTradingPartner()

    const set = <K extends keyof EntityInfo>(k: K, v: EntityInfo[K]) => 
        setData(p => ({ ...p, [k]: v }))

    const isFormValid =
        data.legalName.trim() !== '' &&
        (data.entityType === 'Other' ? customEntityType.trim() !== '' : data.entityType !== '') &&
        data.primaryLineOfBusiness.trim() !== '' &&
        data.businessTaxTin.trim().length >= 2 && 
        (data.sector === 'Other' ? customSector.trim() !== '' : data.sector !== '') &&
        data.registeredAddress.trim() !== '' &&
        data.operationalAddress.trim() !== '' &&
        (data.countriesWhereClientsAreBased ?? '').trim() !== '' &&
        data.intendedPurpose.trim() !== '' &&
        (!data.isRegulated || (data.regulatoryBodyLicenseNumber ?? '').trim() !== '')

    const handleNext = () => {
        setError(null)
        
        const finalType = data.entityType === 'Other' ? customEntityType : data.entityType
        const finalSector = data.sector === 'Other' ? customSector : data.sector
        
        const sanitizedEntityType = finalType.replace(/\s+/g, '')

        mutate({
            tradingPartnerId,
            name: data.legalName,
            previousName: data.previousLegalName || "",
            entityType: sanitizedEntityType, 
            lineOfBusiness: data.primaryLineOfBusiness,
            businessTIN: data.businessTaxTin,
            businessAddress: data.registeredAddress,
            operationalAddress: data.operationalAddress,
            businessSector: finalSector, 
            isEntityRegulated: data.isRegulated,
            licenseNumber: data.regulatoryBodyLicenseNumber || "",
            clientCountries: data.countriesWhereClientsAreBased,
            relationshipPurpose: data.intendedPurpose,
        }, { 
            onSuccess: (resData) => {
                const newId = resData?.tradingPartnerId || resData?.id;
                onNext(newId);
            }, 
            onError: (err: unknown) => setError(getApiErrorMessage(err))
        })
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Entity Information</h2>
                <p className="text-[10px] text-muted-theme mb-8 font-semibold uppercase tracking-wider">Mandatory information marked with <span className="text-red-500">*</span></p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <FieldInput placeholder="Entity Legal Name *" value={data.legalName} onChange={v => set('legalName', v)} />
                    <FieldInput placeholder="Previous Entity name (optional)" value={data.previousLegalName} onChange={v => set('previousLegalName', v)} />
                    
                    <div className="flex flex-col gap-4">
                        <FieldSelect placeholder="Entity Type *" value={data.entityType} onChange={v => set('entityType', v)} options={ENTITY_TYPES} />
                        {data.entityType === 'Other' && (
                            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                <FieldInput placeholder="Specify Entity Type *" value={customEntityType} onChange={setCustomEntityType} />
                            </div>
                        )}
                    </div>
                    
                    <FieldInput placeholder="Business Tax / TIN *" value={data.businessTaxTin} isNumeric={true} maxLength={20} onChange={v => set('businessTaxTin', v)} />
                    
                    <FieldInput placeholder="Primary Line of Business *" value={data.primaryLineOfBusiness} onChange={v => set('primaryLineOfBusiness', v)} />
                    
                    <div className="flex flex-col gap-4">
                        <FieldSelect placeholder="Sector / Primary Business Activity *" value={data.sector} onChange={v => set('sector', v)} options={SECTORS} />
                        {data.sector === 'Other' && (
                            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                                <FieldInput placeholder="Specify Business Sector *" value={customSector} onChange={setCustomSector} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FieldInput placeholder="Registered Business Address *" value={data.registeredAddress} onChange={v => set('registeredAddress', v)} />
                <FieldInput placeholder="Operational Address *" value={data.operationalAddress} onChange={v => set('operationalAddress', v)} />
                
                <FieldSelect placeholder="Countries where clients are based *" value={data.countriesWhereClientsAreBased} onChange={v => set('countriesWhereClientsAreBased', v)} options={COUNTRIES} />
                <FieldInput placeholder="Intended purpose of relationship *" value={data.intendedPurpose} onChange={v => set('intendedPurpose', v)} />
            </div>

            <div className="flex flex-col gap-6 pt-4 border-t border-border-theme">
                <div>
                    <p className="text-sm text-muted-theme mb-4 font-bold uppercase text-[10px]">Is Entity Regulated? *</p>
                    <div className="flex items-center gap-6">
                        {(['Yes', 'No'] as const).map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                <div onClick={() => set('isRegulated', opt === 'Yes')}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${data.isRegulated === (opt === 'Yes') ? 'border-[#185fa5] bg-[#185fa5]' : 'border-border-theme bg-card-bg group-hover:border-gray-400'}`}>
                                    {data.isRegulated === (opt === 'Yes') && <div className="w-2 h-2 rounded-full bg-card-bg" />}
                                </div>
                                <span className={`text-sm font-bold transition-colors ${data.isRegulated === (opt === 'Yes') ? 'text-foreground' : 'text-muted-theme'}`}>{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {data.isRegulated && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <FieldInput placeholder="Regulatory Body & License Number *" value={data.regulatoryBodyLicenseNumber} isNumeric={true} maxLength={20} onChange={v => set('regulatoryBodyLicenseNumber', v)} />
                    </div>
                )}
            </div>

            {error && <p className="text-sm text-red-500 mt-2 font-bold uppercase tracking-wide text-xs">{error}</p>}
            
                                      <NavButtons 
                  showPrev={false} 
                  onNext={handleNext} 
                  disabled={isPending || !isFormValid} 
                  isLoading={isPending} 
             />
        </div>
    )
}

export default function EntityInfoStep({ tradingPartnerId, onNext }: { tradingPartnerId: string; onNext: (id?: string) => void }) {
    const { data: existing, isLoading } = useGetTradingPartner(tradingPartnerId)

    if (tradingPartnerId && isLoading) {
        return <div className="py-20 text-center text-sm text-muted-theme font-medium">Loading saved information...</div>
    }

    const initialData: EntityInfo = {
        legalName: existing?.name || '',
        previousLegalName: existing?.previousName || '',
        entityType: existing?.entityType || '', 
        primaryLineOfBusiness: existing?.lineOfBusiness || '',
        businessTaxTin: existing?.businessTIN || '',
        sector: existing?.businessSector || '',
        registeredAddress: existing?.businessAddress || '',
        operationalAddress: existing?.operationalAddress || '',
        isRegulated: !!existing?.isEntityRegulated,
        regulatoryBodyLicenseNumber: existing?.licenseNumber || '',
        countriesWhereClientsAreBased: existing?.clientCountries || '',
        intendedPurpose: existing?.relationshipPurpose || '',
    }

    return (
        <EntityInfoForm 
            key={tradingPartnerId} 
            initialData={initialData} 
            tradingPartnerId={tradingPartnerId} 
            onNext={onNext} 
        />
    )
}