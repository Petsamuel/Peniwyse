'use client'

import { useRef, useState } from 'react'
import { useDocumentTypes } from '@/app/hooks/use-document-types'
import { useSubmitPartnerDocuments } from '@/app/hooks/use-partner-documents'
import Image from 'next/image'
import { useToast } from '../hooks/use-toast'
import { ToastContainer } from '../components/disbursement/container'
import { getApiErrorMessage } from '../utils/error-message'
import { motion, AnimatePresence } from 'framer-motion'

interface UploadedDoc {
    file: File
    objectUrl: string
    uploadedAt: Date
    error?: string
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
    return `${Math.round(bytes / (1024 * 1024))}MB`
}

function formatDate(date: Date): string {
    const d = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const t = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()
    return `${d} | ${t}`
}

function CheckIcon() {
    return (
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </div>
    )
}

interface ViewerProps {
    doc: UploadedDoc
    docType: string
    onClose: () => void
}

function DocumentViewer({ doc, docType, onClose }: ViewerProps) {
    const [zoom, setZoom] = useState(50)
    const [rotation, setRotation] = useState(0)
    const isPdf = doc.file.type === 'application/pdf'
    const scaleFactor = zoom / 100

    return (
        <div className="fixed inset-0 z-50 flex bg-[#f0f2f5]">
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center justify-center gap-2 py-3 bg-card-bg border-b border-border-theme">
                    <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="w-7 h-7 flex items-center justify-center rounded-full border border-border-theme text-muted-theme hover:bg-surface-hover text-lg">−</button>
                    <span className="text-sm text-muted-theme w-12 text-center">{zoom}%</span>
                    <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="w-7 h-7 flex items-center justify-center rounded-full border border-border-theme text-muted-theme hover:bg-surface-hover text-lg">+</button>
                    <div className="w-px h-5 bg-gray-300 mx-1" />
                    <button onClick={() => setRotation(r => r - 90)} className="p-1.5 hover:bg-surface-hover rounded-full transition-colors"><RotateIcon className="-scale-x-100" /></button>
                    <button onClick={() => setRotation(r => r + 90)} className="p-1.5 hover:bg-surface-hover rounded-full transition-colors"><RotateIcon /></button>
                </div>
                <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-8">
                    <div style={{ transform: `rotate(${rotation}deg) scale(${scaleFactor})`, transition: 'transform 0.2s ease' }}>
                        {isPdf ? <iframe src={doc.objectUrl} className="border-0 shadow-xl bg-card-bg" style={{ width: 800, height: 1100 }} /> : <Image src={doc.objectUrl} alt="" width={800} height={1100} className="shadow-xl max-w-none bg-card-bg" style={{ width: 800, height: 'auto' }} />}
                    </div>
                </div>
            </div>
            <div className="w-80 bg-card-bg border-l border-border-theme flex flex-col shrink-0">
                <div className="p-6 border-b border-border-theme flex items-center justify-between">
                    <button onClick={onClose} className="text-sm font-bold text-[#185fa5] flex items-center gap-2 uppercase tracking-widest">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <p className="text-[10px] font-bold text-muted-theme uppercase tracking-widest mb-4">Document Information</p>
                    <h3 className="text-base font-bold text-foreground mb-6">{doc.file.name}</h3>
                    <div className="flex flex-col gap-5">
                        <DetailRow label="Type" value={docType} />
                        <DetailRow label="Size" value={formatFileSize(doc.file.size)} />
                        <DetailRow label="Uploaded" value={formatDate(doc.uploadedAt)} />
                        <div className="pt-4 mt-4 border-t border-border-theme">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-green-600 bg-green-50 px-3 py-1 rounded-full tracking-widest">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Verified Upload
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-muted-theme uppercase tracking-widest">{label}</span>
            <span className="text-sm font-semibold text-foreground">{value}</span>
        </div>
    )
}

function RotateIcon({ className }: { className?: string }) {
    return (
        <svg className={`w-5 h-5 text-muted-theme ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    )
}

export default function DocumentsTab({ tradingPartnerId, onSubmit }: {
    tradingPartnerId: string
    onSubmit: () => void
}) {
    const { data: documentTypes = [], isLoading } = useDocumentTypes()
    const [uploaded, setUploaded] = useState<Record<string, UploadedDoc>>({})
    const [viewing, setViewing] = useState<string | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
    const toast = useToast()
    const { mutateAsync: submitDocs, isPending } = useSubmitPartnerDocuments()

    const handleFile = (docTypeId: string, file: File | null) => {
        if (!file) return
        setSubmitError(null)

        const MAX_SIZE_MB = 5
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
        let error: string | undefined
        
        if (file.size > MAX_SIZE_BYTES) {
            error = `Exceeds ${MAX_SIZE_MB}MB limit`
        }

        const prev = uploaded[docTypeId]
        if (prev) URL.revokeObjectURL(prev.objectUrl)
        const objectUrl = URL.createObjectURL(file)
        setUploaded(prev => ({ ...prev, [docTypeId]: { file, objectUrl, uploadedAt: new Date(), error } }))
    }

    const handleDelete = (docTypeId: string) => {
        const doc = uploaded[docTypeId]
        if (doc) URL.revokeObjectURL(doc.objectUrl)
        setUploaded(prev => {
            const next = { ...prev }
            delete next[docTypeId]
            return next
        })
        const input = inputRefs.current[docTypeId]
        if (input) input.value = ''
    }

    const uploadedCount = Object.keys(uploaded).length
    const totalCount = documentTypes.length
    const hasErrorFiles = Object.values(uploaded).some(d => !!d.error)
    const isFormValid = uploadedCount === totalCount && totalCount > 0 && !hasErrorFiles

    const handleSubmit = async () => {
        setSubmitError(null)
        const docsToUpload = documentTypes
            .filter(dt => !!uploaded[dt.id])
            .map(dt => ({ file: uploaded[dt.id].file, documentTypeId: dt.id }))
        try {
            await submitDocs({ partnerId: tradingPartnerId, documents: docsToUpload })
            onSubmit()
        } catch (err) {
            setSubmitError(getApiErrorMessage(err)) 
        }
    }

    if (viewing && uploaded[viewing]) {
        return <DocumentViewer doc={uploaded[viewing]} docType={documentTypes.find(dt => dt.id === viewing)?.name || ''} onClose={() => setViewing(null)} />
    }

    return (
        <div className="flex flex-col">
            {/* ── Sticky Progress Bar ── */}
            <div className="sticky top-[-25px] z-30 bg-card-bg/95 backdrop-blur-sm -mx-6 px-8 py-6 mb-8 border-b border-border-theme/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[#185fa5] uppercase tracking-widest">Document Upload Progress</span>
                    <span className="text-xs font-bold text-foreground">{uploadedCount} of {totalCount} documents uploaded</span>
                </div>
                <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: totalCount > 0 ? `${(uploadedCount / totalCount) * 100}%` : 0 }}
                        className="h-full bg-[#185fa5] shadow-lg shadow-[#185fa5]/20"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-8 h-8 border-4 border-border-theme border-t-[#185fa5] rounded-full animate-spin" />
                        <p className="text-sm font-bold text-muted-theme uppercase tracking-widest">Loading document types...</p>
                    </div>
                ) : (
                    documentTypes.map((docType) => {
                        const entry = uploaded[docType.id]
                        const isUploaded = !!entry
                        return (
                            <div key={docType.id} className="group">
                                <div className="flex items-center justify-between py-6 transition-all">
                                    <div className="flex items-center gap-5 min-w-0">
                                        {isUploaded ? (
                                            entry.error ? (
                                                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                </div>
                                            ) : <CheckIcon />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <h3 className={`text-base font-semibold transition-colors ${isUploaded ? (entry.error ? 'text-red-500' : 'text-foreground') : 'text-muted-theme'}`}>
                                                {docType.name}
                                            </h3>
                                            {isUploaded && entry && (
                                                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${entry.error ? 'text-red-400' : 'text-muted-theme'}`}>
                                                    {entry.error ? entry.error : `${entry.file.name.slice(0, 30)}... • ${formatFileSize(entry.file.size)}`}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <input
                                        ref={el => { if(el) inputRefs.current[docType.id] = el }}
                                        type="file" className="hidden" accept="image/*,application/pdf"
                                        onChange={e => handleFile(docType.id, e.target.files?.[0] ?? null)}
                                    />

                                    <div className="flex items-center gap-3">
                                        {isUploaded ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setViewing(docType.id)}
                                                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#185fa5] bg-blue-50 hover:bg-blue-100 transition-all flex items-center gap-2 uppercase tracking-widest"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(docType.id)}
                                                    className="p-2.5 rounded-xl text-muted-theme hover:text-red-500 hover:bg-red-50 transition-all"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => inputRefs.current[docType.id]?.click()}
                                                className="px-6 py-2 rounded-xl text-xs font-bold text-[#185fa5] border border-[#185fa5] hover:bg-blue-50 transition-all uppercase tracking-widest"
                                            >
                                                Upload
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="border-b border-border-theme last:border-0" />
                            </div>
                        )
                    })
                )}
            </div>

            {submitError && <p className="text-xs text-red-500 mt-8 font-bold uppercase tracking-wide text-center">{submitError}</p>}

            <div className="flex justify-end mt-12 pt-8 border-t border-border-theme">
                <button
                    onClick={handleSubmit}
                    disabled={isPending || !isFormValid}
                    className={`flex items-center gap-3 px-10 py-3.5 rounded-xl text-sm font-bold transition-all uppercase tracking-widest ${
                        isFormValid 
                            ? 'bg-[#185fa5] text-white shadow-xl shadow-[#185fa5]/20 hover:scale-[1.02] active:scale-[0.98]' 
                            : 'bg-surface-hover text-muted-theme cursor-not-allowed'
                    }`}
                >
                    {isPending ? 'Submitting Documents...' : 'Finish Onboarding'}
                    {!isPending && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </button>
            </div>

            <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss}/>
        </div>
    )
}
