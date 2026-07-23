import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/app/utils/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RcNumberPayload {
    rcNumber: string
}

/**
 * The API returns the existing partner record if one is found,
 * or null/empty data if this is a new RC number.
 */
export interface RcNumberResult {
    tradingPartnerId: string
    tradingPartnerStatus: string
}

/** Derived helper: a status of "None" means no partner record exists yet */
export function isExistingPartner(result: RcNumberResult): boolean {
    return result.tradingPartnerStatus !== 'None'
}

interface ApiEnvelope<T> {
    data: T
    success: boolean
    code: string
    message: string
    errors: string[]
    hasErrors: boolean
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCheckRcNumber() {
    return useMutation({
        mutationFn: async (payload: RcNumberPayload): Promise<RcNumberResult> => {
            const res: ApiEnvelope<RcNumberResult> = await apiClient(
                'api/trading-partners/rc-number',
                { body: payload as unknown as Record<string, import('@/app/utils/api-client').JsonValue> },
            )

            if (res.hasErrors) {
                throw new Error(res.message || 'Failed to verify RC number.')
            }

            return res.data
        },
    })
}
