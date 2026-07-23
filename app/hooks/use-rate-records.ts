import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/app/utils/api-client'

export interface GlobalRate {
    id: string
    currencyPair: string
    buyRate: number
    sellRate: number
    effectiveDate?: string
    remarks?: string
    status?: string
}

export interface ConcessionalRate {
    id: string
    requisitionNumber: string
    proposedRate: number
    businessPartnerId?: string
    businessPartnerName?: string
    currencyPair: string
    requestedRate: number
    approvedRate?: number
    volume?: number
    effectiveFrom?: string
    approvedBy?: string
    wap?: number
    status?: string
    requestedAmount?: number
    tat?: string
    submissionDate?: string
    relationshipManager?: string
    currentGlobalRate?: number
    concessionalRateApplied?: boolean
    dateCreated: string
}

export interface CreateGlobalRatePayload {
    currencyPair: string
    buyRate: number
    sellRate: number
    // effectiveDate: string
    remarks?: string
}

export interface CreateConcessionalRatePayload {
    currencyPair: string
    requisitionNumber: string
    approvedRate: number
    proposedRate: number
    remarks?: string
  
}

interface ApiEnvelope<T> {
    data: T
    success: boolean
    code: string
    message: string
    errors: string[]
    hasErrors: boolean
}

export const rateKeys = {
    all:                ['rates'] as const,
    globalAll:          ['rates', 'global'] as const,
    concessionalAll:    ['rates', 'concessional'] as const,
    concessionalDetail: (id: string) => ['rates', 'concessional', id] as const,
}

export function useGlobalRates() {
    return useQuery<GlobalRate[]>({
        queryKey: rateKeys.globalAll,
        queryFn: async () => {
            try {
                const response = await fetch('https://open.er-api.com/v6/latest/USD');
                if (!response.ok) throw new Error('Failed to fetch from open exchange rate API');
                
                const data = await response.json();
                
                if (data.result === 'success' && data.rates) {
                    const targetCurrencies = ["NGN", "EUR", "GBP", "CAD", "GHS", "ZAR", "AUD", "CHF"];
                    const rates: GlobalRate[] = targetCurrencies.map((currency) => ({
                        id: `USD${currency}`,
                        currencyPair: `USD/${currency}`,
                        buyRate: data.rates[currency] || 0,
                        sellRate: data.rates[currency] || 0,
                    }));
                    return rates;
                }
                
                return [];
            } catch (error) {
                console.error(error);
                return [];
            }
        },
        staleTime: 60 * 60 * 1000, // Cache for 1 hour
    })
}

export function useConcessionalRates() {
    return useQuery<ConcessionalRate[]>({
        queryKey: rateKeys.concessionalAll,
        queryFn: async () => {
            const res: ApiEnvelope<ConcessionalRate[]> = await apiClient('api/concessional-rates')
            if (res.hasErrors) throw new Error(res.message || 'Failed to load concessional rates.')
            return res.data ?? []
        },
    })
}

export function useConcessionalRateDetail(id: string) {
    return useQuery<ConcessionalRate>({
        queryKey: rateKeys.concessionalDetail(id),
        queryFn: async () => {
            const res: ApiEnvelope<ConcessionalRate> = await apiClient(`api/concessional-rate/${id}`)
            if (res.hasErrors) throw new Error(res.message || 'Failed to load requisition.')
            return res.data
        },
        enabled: !!id,
    })
}

export function useCreateGlobalRate() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (payload: CreateGlobalRatePayload) => {
            const res: ApiEnvelope<GlobalRate> = await apiClient('api/global-rate', {
                body: payload as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            })
            if (res.hasErrors) throw new Error(res.message || 'Failed to set global rate.')
            return res.data
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: rateKeys.globalAll }),
    })
}

export function useCreateConcessionalRate() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (payload: CreateConcessionalRatePayload) => {
            const res: ApiEnvelope<ConcessionalRate> = await apiClient('api/concessional-rates', {
                body: payload as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            })
            if (res.hasErrors) throw new Error(res.message || 'Failed to set concessional rate.')
            return res.data
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: rateKeys.concessionalAll }),
    })
}

export function useApproveConcessionalRate() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const res: ApiEnvelope<ConcessionalRate> = await apiClient(`api/concessional-rate/${id}/approve`, {
                body: {} as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            })
            if (res.hasErrors) throw new Error(res.message || 'Failed to approve requisition.')
            return res.data
        },
        onSuccess: (_, id) => {
            qc.invalidateQueries({ queryKey: rateKeys.concessionalAll })
            qc.invalidateQueries({ queryKey: rateKeys.concessionalDetail(id) })
        },
    })
}

export function useRejectConcessionalRate() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const res: ApiEnvelope<ConcessionalRate> = await apiClient(`api/concessional-rate/${id}/reject`, {
                body: {} as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            })
            if (res.hasErrors) throw new Error(res.message || 'Failed to reject requisition.')
            return res.data
        },
        onSuccess: (_, id) => {
            qc.invalidateQueries({ queryKey: rateKeys.concessionalAll })
            qc.invalidateQueries({ queryKey: rateKeys.concessionalDetail(id) })
        },
    })
}

// Add these to use-rate-records.ts

export function useUpdateGlobalRate() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (payload: GlobalRate) => {
            const res: ApiEnvelope<GlobalRate> = await apiClient('api/global-rate', {
                method: 'PATCH',
                body: payload as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            })
            if (res.hasErrors) throw new Error(res.message || 'Failed to update global rate.')
            return res.data
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: rateKeys.globalAll }),
    })
}

export function useRemoveGlobalRate() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (id: string) => {
            const res: ApiEnvelope<null> = await apiClient(`api/global-rate/remove/${id}`, {
                method: 'POST',
                // body: {} // Some APIs require an empty body for POSTs even if params are in path
            })
            if (res.hasErrors) throw new Error(res.message || 'Failed to deactivate rate.')
            return res.data
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: rateKeys.globalAll }),
    })
}