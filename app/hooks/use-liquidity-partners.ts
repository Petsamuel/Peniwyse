import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/app/utils/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LiquidityPartner {
    id: string
    name: string
    address: string | null
    webUrl: string | null
    contactEmail: string | null
    liquidityPartnerType?: string | null
    phoneNumber?: string | null
    dateJoined?: string | null
    createdAt?: string | null
    status?: 'Completed' | 'Failed' | 'Pending' | null
}

export interface LiquidityPartnerDetail {
    id: string
    name: string
    address: string | null
    webUrl: string | null
    contactEmail: string | null
}


export interface CreateLiquidityPartnerPayload {
    name: string
    address: string
    webUrl: string
    contactEmail: string
    liquidityPartnerType: string
}

export interface UpdateLiquidityPartnerPayload extends CreateLiquidityPartnerPayload {
    id: string
}

interface ApiEnvelope<T> {
    data: T
    success: boolean
    code: string
    message: string
    errors: string[]
    hasErrors: boolean
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export const liquidityPartnerKeys = {
    all:    ['liquidity-partners'] as const,
    filter: (name?: string, contactEmail?: string) =>
                ['liquidity-partners', 'filter', name, contactEmail] as const,
    detail: (id: string) => ['liquidity-partners', id] as const,
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useLiquidityPartners(params?: { name?: string; contactEmail?: string }) {
    const { name, contactEmail } = params ?? {}
    const hasFilter = !!(name || contactEmail)

    return useQuery<LiquidityPartner[]>({
        queryKey: hasFilter
            ? liquidityPartnerKeys.filter(name, contactEmail)
            : liquidityPartnerKeys.all,
        queryFn: async () => {
            const qs = new URLSearchParams()
            if (name)         qs.set('Name', name)
            if (contactEmail) qs.set('ContactEmail', contactEmail)
            const query = qs.toString()
            const res: ApiEnvelope<LiquidityPartner[]> = await apiClient(
                `api/liquidity-partners${query ? `?${query}` : ''}`
            )
            return res.data
        },
    })
}

export function useLiquidityPartner(id: string) {
    return useQuery<LiquidityPartnerDetail>({
        queryKey: liquidityPartnerKeys.detail(id),
        queryFn: async () => {
            const res: ApiEnvelope<LiquidityPartnerDetail> = await apiClient(
                `api/liquidity-partners/${id}`
            )
            return res.data
        },
        enabled: !!id,
    })
}


export function useCreateLiquidityPartner() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: CreateLiquidityPartnerPayload) =>
            apiClient('api/liquidity-partners', {
                body: payload as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: liquidityPartnerKeys.all }),
    })
}

export function useUpdateLiquidityPartner() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: UpdateLiquidityPartnerPayload) =>
            apiClient('api/liquidity-partners', {
                method: 'PATCH', 
                body: payload as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: liquidityPartnerKeys.all })
        },
    })
}

export function useRemoveLiquidityPartner() { 
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) =>
            apiClient(`api/liquidity-partners/remove/${id}`, { 
                method: 'POST' 
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: liquidityPartnerKeys.all }),
    })
}

