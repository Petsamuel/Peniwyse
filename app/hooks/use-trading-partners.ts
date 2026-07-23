import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/app/utils/api-client'

export interface TradingPartner {
    id: string
    name: string
    rcNumber: string | null
    businessSector: string | null
    licenseNumber: string | null
    partnerApprovalStatus: string
}

export interface PartnerDocument {
    id: string
    documentTypeId: string
    documentUrl: string
}

export interface PartnerUBO {
    id: string
    fullName: string
    shareholding: number
    nationality: string
}

export interface PartnerDirector {
    id: string
    fullName: string
    nationality: string
    dateOfBirth: string
}

export interface TradingPartnerDetail {
    id: string
    name: string
    previousName: string | null
    rcNumber: string | null
    entityType: string | null
    lineOfBusiness: string | null
    businessTIN: string | null
    businessAddress: string | null
    operationalAddress: string | null
    businessSector: string | null
    isEntityRegulated: boolean | null
    licenseNumber: string | null
    clientCountries: string | null
    relationshipPurpose: string | null
    partnerApprovalStatus: string
    documents: PartnerDocument[]
    shareholders: unknown[]
    ultimateBeneficialOwners: PartnerUBO[]
    directors: PartnerDirector[]
    approvals: unknown[]
}

export interface CreateTradingPartnerPayload {
    name: string
    contactPhone: string
    contactEmail: string
    address: string
}

interface ApiEnvelope<T> {
    data: T
    success: boolean
    code: string
    message: string
    errors: string[]
    hasErrors: boolean
}

export type PartnerApprovalStatus = 'Pending' | 'Rejected' | 'Inview' | 'Approved';

interface PartnerStatusUpdatePayload {
    tradingPartnerId: string;
    partnerApprovalStatus: PartnerApprovalStatus;
    partnerResponseCode?: string;
}

export const tradingPartnerKeys = {
    all: ['trading-partners'] as const,
    search: (query: string) => ['trading-partners', 'search', query] as const,
    detail: (id: string) => ['trading-partners', id] as const,
}


export function useTradingPartners() {
    return useQuery<TradingPartner[]>({
        queryKey: tradingPartnerKeys.all,
        queryFn: async () => {
            const res: ApiEnvelope<TradingPartner[]> = await apiClient('api/trading-partners')
            return res.data
        },
    })
}

export function useSearchTradingPartners(query: string) {
    return useQuery<TradingPartner[]>({
        queryKey: tradingPartnerKeys.search(query),
        queryFn: async () => {
            const res: ApiEnvelope<TradingPartner[]> = await apiClient(
                `api/trading-partners/search?query=${encodeURIComponent(query)}`,
            )
            return res.data
        },
        enabled: query.trim().length > 0,
    })
}

export function useTradingPartner(id: string) {
    return useQuery<TradingPartnerDetail>({
        queryKey: tradingPartnerKeys.detail(id),
        queryFn: async () => {
            const res: ApiEnvelope<TradingPartnerDetail> = await apiClient(`api/trading-partners/${id}`)
            return res.data
        },
        enabled: !!id,
    })
}

export function useCreateTradingPartner() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload: CreateTradingPartnerPayload) =>
            apiClient('api/trading-partners', {
                body: payload as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: tradingPartnerKeys.all }),
    })
}

export function useApproveTradingPartner() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (partnerId: string) =>
            apiClient('api/trading-partners/approve', {
                body: { partnerId } as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: tradingPartnerKeys.all }),
    })
}

export function useUpdatePartnerStatus() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ 
            partnerId, 
            status, 
            reason 
        }: { 
            partnerId: string; 
            status: PartnerApprovalStatus; 
            reason?: string 
        }) => {
            let responseCode: string | undefined = undefined;

            // 1. Fetch response code ONLY for Rejection
            if (status === 'Rejected' && reason) {
                const rcResult = await apiClient('api/response-codes', { 
                    body: { reason } 
                }) as { data: { code: string } };
                
                responseCode = rcResult?.data?.code;
            }

            // 2. Construct the exact request body required
            const payload: PartnerStatusUpdatePayload = {
                tradingPartnerId: partnerId,
                partnerApprovalStatus: status,
                // Only include the code if it was generated (for Rejected)
                ...(responseCode && { partnerResponseCode: responseCode })
            };

            // 3. Call the update endpoint
            return apiClient('api/trading-partners/approve', {
                body: payload as unknown as Record<string, import('@/app/utils/api-client').JsonValue>,
            });
        },
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: tradingPartnerKeys.all });
            qc.invalidateQueries({ queryKey: tradingPartnerKeys.detail(variables.partnerId) });
        },
    });
}