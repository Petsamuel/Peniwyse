import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/app/utils/api-client'

export interface PurchaseRecord {
    id: string
    liquidityPartnerId: string
    partnerName?: string
    sourceCurrency: string
    targetCurrency: string
    rate: number
    amount: number
    status?: string
    transactionDate?: string
    createdBy?: string
}

export interface CreatePurchasePayload {
    liquidityPartnerId: string
    sourceCurrency: string
    targetCurrency: string
    rate: number
    amount: number
}

export interface PurchaseListParams {
    liquidityPartnerId?: string
    sourceCurrency?: string
    targetCurrency?: string
}

interface ApiEnvelope<T> {
    data: T
    success: boolean
    code: string
    message: string
    errors: string[]
    hasErrors: boolean
}

export interface TrendDataPoint {
    label: string
    totalAmount: number
}
export interface VolumeDataPoint {
    partnerName: string
    totalVolume: number
}

export const purchaseKeys = {
    all:    ['purchases'] as const,
    list:   (params: PurchaseListParams) => ['purchases', 'list', params] as const,
    detail: (id: string)                 => ['purchases', id] as const,
    trend:  (period: string)             => ['purchases', 'trend', period] as const,
    volumeByPartner: ()    => ['purchases', 'volumeByPartner', ] as const,
}

export function usePurchaseTransactionTrend(period: string) {
    return useQuery<TrendDataPoint[]>({
        queryKey: purchaseKeys.trend(period),
        queryFn: async () => {
            const res: ApiEnvelope<TrendDataPoint[]> = await apiClient(
                `api/buy/analytics/transaction-trend?period=${encodeURIComponent(period)}`
            )
            if (res.hasErrors) throw new Error(res.message || 'Failed to load trend data.')
            return res.data ?? []
        },
    })
}
export function usePurchaseVolumeByPartner() {
    return useQuery<VolumeDataPoint[]>({
        queryKey: purchaseKeys.volumeByPartner(),
        queryFn: async () => {
            const res: ApiEnvelope<VolumeDataPoint[]> = await apiClient(
                `api/buy/analytics/volume-by-partner`
            )
            if (res.hasErrors) throw new Error(res.message || 'Failed to load volume data.')
            return res.data ?? []
        },
    })
}

export function usePurchases(params?: PurchaseListParams) {
    const { liquidityPartnerId, sourceCurrency, targetCurrency } = params ?? {}

    return useQuery<PurchaseRecord[]>({
        queryKey: purchaseKeys.list({ liquidityPartnerId, sourceCurrency, targetCurrency }),
        queryFn: async () => {
            const qs = new URLSearchParams()
            if (liquidityPartnerId) qs.set('LiquidityPartnerId', liquidityPartnerId)
            if (sourceCurrency)     qs.set('SourceCurrency', sourceCurrency)
            if (targetCurrency)     qs.set('TargetCurrency', targetCurrency)
            const query = qs.toString()
            const res: ApiEnvelope<PurchaseRecord[]> = await apiClient(
                `api/buy${query ? `?${query}` : ''}`
            )
            if (res.hasErrors) throw new Error(res.message || 'Failed to load purchases.')
            return res.data ?? []
        },
    })
}

export function usePurchase(id: string) {
    return useQuery<PurchaseRecord>({
        queryKey: purchaseKeys.detail(id),
        queryFn: async () => {
            const res: ApiEnvelope<PurchaseRecord> = await apiClient(`api/buy/${id}`)
            if (res.hasErrors) throw new Error(res.message || 'Failed to load purchase.')
            return res.data
        },
        enabled: !!id,
    })
}

export function useCreatePurchase() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (payload: CreatePurchasePayload) => {
            const res: ApiEnvelope<PurchaseRecord> = await apiClient('api/buy', {
                body: payload as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            })
            if (res.hasErrors) throw new Error(res.message || 'Failed to create purchase.')
            return res.data
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: purchaseKeys.all })
            qc.invalidateQueries({ queryKey: ['inventory'] })
            qc.invalidateQueries({ queryKey: ['purchases', 'trend'] })
            qc.invalidateQueries({ queryKey: ['purchases', 'volumeByPartner'] })
        },
    })
}
