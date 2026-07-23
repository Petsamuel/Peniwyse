import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/app/utils/api-client'

export interface TreasuryRecord {
    id: string
    requisitionNumber: string
    tradingPartnerId?: string
    tradingPartnerName?: string
    currencyPair: string
    volume: number
    proposedRate: number
    remarks?: string
    requestedOn?: string
    status?: string
    requestedBy?: string
    documentUrl: string
    date: string
    isPublished: boolean
}

export interface CreateTreasuryPayload {
    tradingPartnerId: string
    currencyPair: string
    volume: number
    proposedRate: number
    remarks?: string
}

export interface TreasuryListParams {
    status?: string
    tradingPartnerId?: string
    currencyPair?: string
    requisitionNo?: string
}

interface ApiEnvelope<T> {
    data: T
    success: boolean
    code: string
    message: string
    errors: string[]
    hasErrors: boolean
}

export const treasuryKeys = {
    all:    ['treasury'] as const,
    list:   (params: TreasuryListParams) => ['treasury', 'list', params] as const,
    detail: (id: string)                 => ['treasury', id] as const,
}

export function useTreasuryRecords(params?: TreasuryListParams) {
    const { status, tradingPartnerId, currencyPair, requisitionNo } = params ?? {}

    return useQuery<TreasuryRecord[]>({
        queryKey: treasuryKeys.list({ status, tradingPartnerId, currencyPair, requisitionNo }),
        queryFn: async () => {
            const qs = new URLSearchParams()
            if (tradingPartnerId) qs.set('TradingPartnerId', tradingPartnerId)
            if (currencyPair)     qs.set('CurrencyPair', currencyPair)
            if (requisitionNo)    qs.set('RequisitionNo', requisitionNo)
            if (status)           qs.set('Status', status)
            const query = qs.toString()
            const res: ApiEnvelope<TreasuryRecord[]> = await apiClient(
                `api/sales-requisition${query ? `?${query}` : ''}`
            )
            if (res.hasErrors) throw new Error(res.message || 'Failed to load sales requisitions.')
            return res.data ?? []
        },
    })
}

export function useTreasuryRecord(requisitionNumber: string) {
    return useQuery<TreasuryRecord>({
        queryKey: treasuryKeys.detail(requisitionNumber),
        queryFn: async () => {
            const res: ApiEnvelope<TreasuryRecord> = await apiClient(`api/sales-requisition/${requisitionNumber}`)
            if (res.hasErrors) throw new Error(res.message || 'Failed to load sales requisition.')
            return res.data 
        },
        enabled: !!requisitionNumber,
    })
}

export function useCreateTreasuryRecord() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (payload: CreateTreasuryPayload) => {
            const res: ApiEnvelope<TreasuryRecord> = await apiClient('api/sales-requisition', {
                body: payload as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            })
            if (res.hasErrors) throw new Error(res.message || 'Failed to create sales requisition.')
            return res.data
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: treasuryKeys.all }),
    })
}

export function useApproveTreasuryRecord() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const res: ApiEnvelope<TreasuryRecord> = await apiClient('api/sales-requisition/approve', {
                body: { id, status: 'Pending' } as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            })
            if (res.hasErrors) throw new Error(res.message || 'Failed to approve sales requisition.')
            return res.data
        },
        onSuccess: (_, id) => {
            qc.invalidateQueries({ queryKey: treasuryKeys.all })
            qc.invalidateQueries({ queryKey: treasuryKeys.detail(id) })
        },
    })
}
