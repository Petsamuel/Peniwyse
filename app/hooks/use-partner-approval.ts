import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/app/utils/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocumentStatus = 'pending' | 'approved' | 'rejected'

export interface PartnerApprovalDocument {
    id: string
    partnerId: string
    partnerName: string
    documentTypeId: string
    documentTypeName: string
    fileName: string
    uploadedOn: string
    uploadedBy: string
    status: DocumentStatus
    statusDate?: string
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export const partnerApprovalKeys = {
    all: ['partners-approval'] as const,
    byPartner: (partnerId: string) => ['partners-approval', partnerId] as const,
    byStatus: (status: DocumentStatus) => ['partners-approval', 'status', status] as const,
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function usePartnerApprovals() {
    return useQuery<PartnerApprovalDocument[]>({
        queryKey: partnerApprovalKeys.all,
        queryFn: () => apiClient('api/partners-approval'),
    })
}

export function useApproveDocument() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (documentId: string) =>
            apiClient(`api/partners-approval/${documentId}/approve`, { method: 'POST' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: partnerApprovalKeys.all }),
    })
}

export function useRejectDocument() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (documentId: string) =>
            apiClient(`api/partners-approval/${documentId}/reject`, { method: 'POST' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: partnerApprovalKeys.all }),
    })
}
