import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/app/utils/api-client'

export interface Currency {
    currencyPair: string
}

interface ApiEnvelope<T> {
    data: T
    success: boolean
    code: string
    message: string
    errors: string[]
    hasErrors: boolean
}

export const currencyKeys = {
    all: ['currencies'] as const,
}

export function useCurrencies() {
    return useQuery<Currency[]>({
        queryKey: currencyKeys.all,
        queryFn: async () => {
            const res: ApiEnvelope<Currency[]> = await apiClient('api/currencies')
            if (res.hasErrors) {
                throw new Error(res.message || 'Failed to fetch currencies')
            }
            return res.data
        },
    })
}

export function useCreateCurrency() {
    const qc = useQueryClient()

    return useMutation({
        mutationFn: async (currencyPair: string) => {
            // Based on the Swagger image, currencyPair is a query parameter
            const res: ApiEnvelope<Currency> = await apiClient(
                `api/currencies?currencyPair=${encodeURIComponent(currencyPair)}`,
                {
                    method: 'POST',
                }
            )

            if (res.hasErrors) {
                throw new Error(res.message || 'Failed to create currency')
            }

            return res.data
        },
        onSuccess: () => {
            // Invalidate the list to trigger a refetch and update the UI
            qc.invalidateQueries({ queryKey: currencyKeys.all })
        },
    })
}