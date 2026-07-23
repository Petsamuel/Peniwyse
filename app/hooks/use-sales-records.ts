import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/app/utils/api-client'

export interface SalesRecord {
     id: string
    rate: number
    volume: number
    tradingPartnerId: string    
    traderPartnerName: string
    status: string
    sourceCurrency: string
    targetCurrency: string
    totalAmount: number
    requestor: string
    createdAt: string
}

export interface SalesListParams {
    sourceCurrency?: string
    targetCurrency?: string
    status?: string
}

interface ApiEnvelope<T> {
    data: T
    success: boolean
    code: string
    message: string
    errors: string[]
    hasErrors: boolean
}

export const salesKeys = {
    all:    ['sales'] as const,
    list:   (params: SalesListParams) => ['sales', 'list', params] as const,
    detail: (id: string)              => ['sales', id] as const,
}

export function useSales(params?: SalesListParams) {
    const { sourceCurrency, targetCurrency, status } = params ?? {}

    return useQuery<SalesRecord[]>({
        queryKey: salesKeys.list({ sourceCurrency, targetCurrency, status }),
        queryFn: async () => {
            const qs = new URLSearchParams()
            if (sourceCurrency) qs.set('SourceCurrency', sourceCurrency)
            if (targetCurrency) qs.set('TargetCurrency', targetCurrency)
            if (status)         qs.set('Status', status)
            const query = qs.toString()
            const res: ApiEnvelope<SalesRecord[]> = await apiClient(
                `api/sales-records${query ? `?${query}` : ''}`
            )
            if (res.hasErrors) throw new Error(res.message || 'Failed to load sales records.')
            return res.data ?? []
        },
    })
}

export function useSalesDetail(id: string) {
    return useQuery<SalesRecord>({
        queryKey: salesKeys.detail(id),
        queryFn: async () => {
            const res: ApiEnvelope<SalesRecord> = await apiClient(`api/sales-records/${id}`)
            if (res.hasErrors) throw new Error(res.message || 'Failed to load sales record.')
            return res.data
        },
        enabled: !!id,
    })
}
