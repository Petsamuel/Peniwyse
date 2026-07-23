'use client'

import { useState } from 'react'
import FieldInput from '@/app/components/field-input'
import { NavButtons } from '../nav-buttons'
import { type Contact, type Declaration } from '../type'
import { useCreateContactDeclaration, useGetContactDeclaration } from '@/app/hooks/use-onboarding'
import DatePicker from '@/app/components/date-picker'
import { getApiErrorMessage } from '@/app/utils/error-message'

const emptyContact = (): Contact => ({ fullName: '', phoneNumber: '', email: '', jobTitle: '' })
const emptyDeclaration = (): Declaration => ({ individualCompanyName: '', contactPersonNamePosition: '', idNinCompanyNumber: '', individualCompanyAddress: '', authorizedSignature: '', date: '' })

function ContactDeclarationForm({
    tradingPartnerId,
    initialContacts,
    initialDecl,
    onPrev,
    onNext
}: {
    tradingPartnerId: string,
    initialContacts: Contact[],
    initialDecl: Declaration,
    onPrev: () => void,
    onNext: () => void
}) {
    const [contacts, setContacts] = useState<Contact[]>(initialContacts.length > 0 ? initialContacts : [emptyContact()])
    const [decl, setDecl] = useState<Declaration>(initialDecl)
    const [error, setError] = useState<string | null>(null)
    const { mutate, isPending } = useCreateContactDeclaration()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const updateContact = (i: number, k: keyof Contact, v: string) => 
        setContacts(p => p.map((x, j) => j === i ? { ...x, [k]: v } : x))
    
    const updateDecl = (k: keyof Declaration, v: string) => 
        setDecl(p => ({ ...p, [k]: v }))

    const isFormValid = 
        contacts.every(c => 
            (c.fullName || '').trim() !== '' && 
            (c.phoneNumber || '').trim() !== '' && 
            emailRegex.test((c.email || '').trim()) && 
            (c.jobTitle || '').trim() !== ''
        ) &&
        (decl.individualCompanyName || '').trim() !== '' && 
        (decl.contactPersonNamePosition || '').trim() !== '' && 
        (decl.idNinCompanyNumber || '').trim() !== '' && 
        (decl.individualCompanyAddress || '').trim() !== '' && 
        (decl.date || '').trim() !== '';

    const handleSubmit = () => {
        if (!isFormValid) return
        setError(null)
        mutate({
            tradingPartnerId,
            contactDeclarations: contacts.map(c => ({
                jobTitle: c.jobTitle,
                fullname: c.fullName,
                phoneNumber: c.phoneNumber,
                email: c.email,
                companyName: decl.individualCompanyName,
                companyNumber: decl.idNinCompanyNumber,
                contactPerson: decl.contactPersonNamePosition,
                companyAddress: decl.individualCompanyAddress,
                date: decl.date,
            })),
        }, { 
            onSuccess: onNext, 
            onError: (err: unknown) => setError(getApiErrorMessage(err)) 
        })
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-foreground mb-1">Primary Contacts</h2>
                        <p className="text-xs text-muted-theme">Onboard authorized contact persons.</p>
                    </div>
                    <button type="button" onClick={() => setContacts(p => [...p, emptyContact()])} className="flex items-center gap-1 text-xs font-medium text-foreground border border-[#344767] rounded-lg px-3 py-1.5 hover:bg-[#344767] hover:text-white transition-all">
                        + Add Contact
                    </button>
                </div>

                <div className="flex flex-col gap-8">
                    {contacts.map((c, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <FieldInput placeholder="Full Name *" value={c.fullName} onChange={v => updateContact(i, 'fullName', v)} />
                            <FieldInput placeholder="Phone Number *" value={c.phoneNumber} isNumeric maxLength={20} onChange={v => updateContact(i, 'phoneNumber', v)} />
                            <FieldInput placeholder="Email Address *" type="email" value={c.email} onChange={v => updateContact(i, 'email', v)} />
                            <FieldInput placeholder="Job Title *" value={c.jobTitle} onChange={v => updateContact(i, 'jobTitle', v)} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Declaration Section ── */}
            <div className="border-t border-border-theme pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <FieldInput placeholder="Individual / Company Name *" value={decl.individualCompanyName} onChange={v => updateDecl('individualCompanyName', v)} />
                    <FieldInput placeholder="Contact Person Name & Position *" value={decl.contactPersonNamePosition} onChange={v => updateDecl('contactPersonNamePosition', v)} />
                    <FieldInput placeholder="ID / NIN / Company Number *" value={decl.idNinCompanyNumber} isNumeric maxLength={20} onChange={v => updateDecl('idNinCompanyNumber', v)} />
                    <FieldInput placeholder="Individual / Company Address *" value={decl.individualCompanyAddress} onChange={v => updateDecl('individualCompanyAddress', v)} />
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-muted-theme uppercase font-bold ml-1">Declaration Date *</label>
                        <DatePicker 
                            value={decl.date} 
                            placeholder="Select Date"
                            onChange={v => updateDecl('date', v)} 
                            disablePast={true} 
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-[#EC407A] mt-6 font-medium">{error}</p>}
                
                <div className="mt-4">
                    <NavButtons 
                        onPrev={onPrev} 
                        onNext={handleSubmit} 
                        nextLabel="Next" 
                        disabled={!isFormValid || isPending} 
                        isLoading={isPending} 
                    />
                </div>
            </div>
        </div>
    )
}
// ─── PARENT COMPONENT: Data Hydrator ───
export default function ContactDeclarationStep({ tradingPartnerId, onPrev, onNext }: { tradingPartnerId: string; onPrev: () => void; onNext: () => void }) {
    const { data: existing, isLoading } = useGetContactDeclaration(tradingPartnerId)

    if (isLoading) return <div className="py-20 text-center text-sm text-muted-theme font-medium">Loading saved declaration...</div>

    // Map existing single-contact response to UI array
    const initialContacts: Contact[] = existing ? [{
        fullName: existing.fullname || '',
        phoneNumber: existing.phoneNumber || '',
        email: existing.email || '',
        jobTitle: existing.jobTitle || ''
    }] : []

    const initialDecl: Declaration = existing ? {
        individualCompanyName: existing.companyName || '',
        contactPersonNamePosition: existing.contactPerson || '',
        idNinCompanyNumber: existing.companyNumber || '',
        individualCompanyAddress: existing.companyAddress || '',
        date: existing.date || '',
        authorizedSignature: ''
    } : emptyDeclaration()

    return (
        <ContactDeclarationForm 
            key={tradingPartnerId}
            tradingPartnerId={tradingPartnerId}
            initialContacts={initialContacts}
            initialDecl={initialDecl}
            onPrev={onPrev}
            onNext={onNext}
        />
    )
}