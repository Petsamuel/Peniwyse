import { MdCheckCircle, MdCancel, MdHourglassEmpty } from 'react-icons/md'
import { DocumentStatus } from '@/app/hooks/use-partner-documents'

export const ACCEPTED_EXTS = ['.pdf', '.jpg', '.jpeg', '.png']
export const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
export const MAX_SIZE_BYTES = 10 * 1024 * 1024

export const statusBadge: Record<DocumentStatus, { label: string; className: string; icon: React.ReactNode }> = {
    Approved: {
        label: 'Approved',
        className: 'bg-green-100 text-green-700',
        icon: <MdCheckCircle size={13} />,
    },
    Rejected: {
        label: 'Rejected',
        className: 'bg-red-100 text-red-500',
        icon: <MdCancel size={13} />,
    },
    Pending: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-700',
        icon: <MdHourglassEmpty size={13} />,
    },
    Inview: {
        label: 'In Review',
        className: 'bg-blue-100 text-blue-700',
        icon: <MdHourglassEmpty size={13} />,
    },
}

export const partnerStatusStyles: Record<string, string> = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    rejected: 'bg-red-100 text-red-500',
}

export function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}


export function validateFile(file: File): string | undefined {
    if (!ACCEPTED_TYPES.includes(file.type)) return 'Invalid type. Only PDF, JPG, PNG allowed.'
    if (file.size > MAX_SIZE_BYTES) return `Exceeds 10 MB (${formatBytes(file.size)}).`
    return undefined
}