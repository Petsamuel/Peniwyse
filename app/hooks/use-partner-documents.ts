import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/app/utils/api-client'

export type DocumentStatus = 'Pending' | 'Approved' | 'Rejected' | 'Inview'

export interface PartnerDocument {
    partnerId: string
    tradingPartnerName: string
    documentUrl: string
    documentTypeId: string
    documentTypeName: string
    docStatus: DocumentStatus
}

export interface CreatePartnerDocumentPayload {
    partnerId: string
    documentTypeId: string
    documentUrl: string
}

interface ApiEnvelope<T> {
    data: T
    success: boolean
    code: string
    message: string
    errors: string[]
    hasErrors: boolean
}

export const partnerDocumentKeys = {
    all: ['partner-documents'] as const,
    detail: (id: string) => ['partner-documents', id] as const,
    byPartner: (partnerId: string) => ['partner-documents', 'partner', partnerId] as const,
}

export function usePartnerDocuments() {
    return useQuery<PartnerDocument[]>({
        queryKey: partnerDocumentKeys.all,
        queryFn: async () => {
            const res: ApiEnvelope<PartnerDocument[]> = await apiClient('api/partner-documents')
            return res.data
        },
    })
}

export function usePartnerDocument(id: string) {
    return useQuery<PartnerDocument>({
        queryKey: partnerDocumentKeys.detail(id),
        queryFn: async () => {
            const res: ApiEnvelope<PartnerDocument> = await apiClient(`api/partner-documents/${id}`)
            return res.data
        },
        enabled: !!id,
    })
}

export function useCreatePartnerDocument() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: CreatePartnerDocumentPayload) =>
            apiClient('api/partner-documents', {
                body: payload as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: partnerDocumentKeys.all }),
    })
}

export interface ApprovePayload {
    partnerDocumentId: string
    docStatus: DocumentStatus
}

export function useApproveDocument() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: ApprovePayload) =>
            apiClient('api/partner-documents/approve', {
                body: payload as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: partnerDocumentKeys.all }),
    })
}

export interface RejectPayload {
    partnerId: string
    documentTypeId: string
    documentUrl: string
}

export function useRejectDocument() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ partnerId, documentTypeId, documentUrl }: RejectPayload) => {
            const params = new URLSearchParams({ partnerId, documentTypeId, documentUrl })
            return apiClient(`api/partner-rejections?${params}`)
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: partnerDocumentKeys.all }),
    })
}

export function useCreateResponseCode() {
    return useMutation({
        mutationFn: (payload: { reason: string }) =>
            apiClient('api/response-codes', {
                body: payload as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            }),
    })
}

export interface SubmitPartnerDocumentsPayload {
    partnerId: string
    documents: { file: File; documentTypeId: string }[]
}

export function useSubmitPartnerDocuments() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async ({ partnerId, documents }: SubmitPartnerDocumentsPayload) => {
            const formData = new FormData()
            formData.append('partnerId', partnerId)
            documents.forEach((d, index) => {
                formData.append(`documents[${index}].file`, d.file)
                formData.append(`documents[${index}].documentTypeId`, d.documentTypeId)
            })
            const res: ApiEnvelope<unknown> = await apiClient('api/partner-documents', {
                body: formData as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
                // isFormData: true,
            })
            if (res.hasErrors) throw new Error(res.message || 'Failed to upload documents.')
            return res.data
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: partnerDocumentKeys.all }),
    })
}