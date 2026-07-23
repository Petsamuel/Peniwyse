import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, type JsonValue } from '@/app/utils/api-client'

interface ApiEnvelope {
    success: boolean
    code: string
    message: string
    errors: string[]
    hasErrors: boolean
    data: unknown
}

async function post(path: string, body: Record<string, JsonValue>) {
    const res: ApiEnvelope = await apiClient(path, { body })
    if (res.hasErrors) {
        const errorMessage = res.errors?.length ? res.errors.join(", ") : res.message || `Failed: ${path}`
        throw new Error(errorMessage)
    }
    return res.data
}

async function getOne<T>(path: string): Promise<T | null> {
    try {
        const res: ApiEnvelope = await apiClient(path)
        if (res.hasErrors) return null
        return res.data as T
    } catch {
        return null
    }
}

async function getList<T>(path: string): Promise<T[]> {
    try {
        const res: ApiEnvelope = await apiClient(path)
        if (res.hasErrors) return []
        return (res.data as T[]) ?? []
    } catch {
        return []
    }
}

export interface EntityInfoPayload {
    tradingPartnerId: string
    rcNumber?: string
    name: string
    previousName: string
    entityType: string
    lineOfBusiness: string
    businessTIN: string
    businessAddress: string
    operationalAddress: string
    businessSector: string
    isEntityRegulated: boolean
    licenseNumber: string
    clientCountries: string
    relationshipPurpose: string
}

export function useCreateTradingPartner() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: async (payload: EntityInfoPayload) => {
            const response = await post('api/trading-partners', payload as unknown as Record<string, JsonValue>);
            return response as { tradingPartnerId?: string; id?: string } | null;
        },
        onSuccess: (data, variables) => {
            const id = data?.tradingPartnerId || data?.id || variables.tradingPartnerId;
            if (id) {
                qc.invalidateQueries({ queryKey: ['trading-partner', id] })
            }
        }
    })
}

export function useGetTradingPartner(id: string) {
    return useQuery<EntityInfoPayload | null>({
        queryKey: ['trading-partner', id],
        queryFn: () => getOne<EntityInfoPayload>(`api/trading-partners/${id}`),
        enabled: !!id,
        staleTime: 5000,
    })
}

export interface UBOItem {
    title: string
    fullname: string
    address: string
    shareholding: number
    nationality: string
}

export interface UBOPayload {
    tradingPartnerId: string
    ultimateBeneficialOwners: UBOItem[]
}

export function useCreateUBO() {
    return useMutation({
        mutationFn: (payload: UBOPayload) =>
            post('api/ultimate-beneficial-owners', payload as unknown as Record<string, JsonValue>),
    })
}

export function useGetUBOs(tradingPartnerId: string) {
    return useQuery<UBOItem[]>({
        queryKey: ['ubos', tradingPartnerId],
        queryFn: () => getList<UBOItem>(`api/ultimate-beneficial-owners?tradingPartnerId=${tradingPartnerId}`),
        enabled: !!tradingPartnerId,
    })
}

// ─── Step 3: Directors ───────────────────────────────────────────────────────

export interface DirectorItem {
    title: string
    fullname: string
    address: string
    dateOfBirth: string
    nationality: string
}

export interface DirectorPayload {
    tradingPartnerId: string
    businessDirectors: DirectorItem[]
}

export function useCreateDirector() {
    return useMutation({
        mutationFn: (payload: DirectorPayload) =>
            post('api/business-directors', payload as unknown as Record<string, JsonValue>),
    })
}


export interface ContactDeclarationItem {
    jobTitle: string
    fullname: string
    phoneNumber: string
    email: string
    companyName: string
    companyNumber: string
    contactPerson: string
    companyAddress: string
    date: string
}

export interface ContactDeclarationPayload {
    tradingPartnerId: string
    contactDeclarations: ContactDeclarationItem[]
}

export function useCreateContactDeclaration() {
    return useMutation({
        mutationFn: (payload: ContactDeclarationPayload) =>
            post('api/contact-declarations', payload as unknown as Record<string, JsonValue>),
    })
}

export interface ShareholderItem {
    name: string
    address: string
    shareholding: number
}

export interface ShareholderPayload {
    tradingPartnerId: string
    tradingPartnerShareholders: ShareholderItem[]
}

export function useCreateShareholder() {
    return useMutation({
        mutationFn: (payload: ShareholderPayload) =>
            post('api/partner-shareholders', payload as unknown as Record<string, JsonValue>),
    })
}

// ─── CDD Questionnaire ───────────────────────────────────────────────────────

export interface CddQuestionnairePayload {
    tradingPartnerId: string
    hasUltimateBeneficiaryOwner: boolean
    hasPEP: boolean
    pepDetails: string
    countriesOfOperation: string[]
    numberOfLocations: number
    yearsInBusiness: number
    natureOfBusiness: string
    otherNatureOfBusiness: string
    legalStatus: string
    requiresCentralBankOrSECApproval: boolean
    approvalDetails: string
    compliesWithFinancialRegulation: boolean
    regulationDetails: string
    hasLegalClaimsOrConvictions: boolean
    legalClaimsDetails: string
    hasAMLPolicy: boolean
    auditorNameAndAddress: string
    sanctionScreeningLists: string
    hasDocumentedAMLPolicy: boolean
    amlPolicyReviewFrequency: string
    conductsRiskAssessment: boolean
    hasMoneyLaunderingOfficer: boolean
    hasWrittenAMLProcedures: boolean
    isAMLResponsibilitiesClearlyAssigned: boolean
    hasRiskBasedCustomerAssessment: boolean
    appliesEnhancedDueDiligence: boolean
    operatesInHighRiskCountries: boolean
    involvedInHighRiskIndustries: boolean
    hasImplementedIdentificationProcess: boolean
    collectsCustomerBusinessInformation: boolean
    assessesCustomerAMLPolicies: boolean
    reviewsHighRiskCustomers: boolean
    maintainsCustomerRecords: boolean
    performsRiskAssessmentOnCustomers: boolean
    hasTransactionsIdentifyingPolicies: boolean
    hasIdentifyingProceduresStructuring: boolean
    isCustomerAndTransactionScreened: boolean
    hasPoliciesWithBanks: boolean
    hasWolfsbergTransparencyPrinciples: boolean
    hasMonitoringProgram: boolean
    hasEscalationProcess: boolean
    transactionMonitorMethod: string
    manualMonitoringDetails: string
    providesAMLTraining: boolean
    retainsAMLTrainingRecords: boolean
    communicatesAMLPolicyUpdates: boolean
    usesThirdParties: boolean
    authorizedFullname: string
    position: string
    date: string
}

export function useSubmitCddQuestionnaire() {
    return useMutation({
        mutationFn: (payload: CddQuestionnairePayload) =>
            post('api/cdd-questionnaire', payload as unknown as Record<string, JsonValue>),
    })
}

// ─── RC Number Lookup ─────────────────────────────────────────────────────────

export type OnboardingStatus =
    | 'None'
    | 'EntityInfo'
    | 'UBO'
    | 'EntityShareholder'
    | 'Director'
    | 'OnboardingCompleted'
    | 'QuestionnaireCompleted'
    | 'DocumentsUploaded'

export interface RcLookupResponse {
    tradingPartnerId: string
    tradingPartnerStatus: OnboardingStatus
}

export interface RcLookupResponseEnvelope {
    data: RcLookupResponse
    success: boolean
    message: string
    hasErrors: boolean
}


export function usePartnerByRcNumber(rcNumber: string) {
    return useQuery<RcLookupResponse | null>({
        queryKey: ['partner-by-rc', rcNumber],
        queryFn: async () => {
            try {
                const res = await apiClient('api/trading-partners/rc-number', {
                    body: { rcNumber } as Record<string, JsonValue>
                });
                return res.data as RcLookupResponse;
            } catch {
                return null;
            }
        },
        enabled: !!rcNumber,
        staleTime: 0,
        retry: false,
    })
}

export interface TradingPartnerResponse {
    name: string
    previousName: string
    entityType: string
    lineOfBusiness: string
    businessTIN: string
    businessAddress: string
    operationalAddress: string
    businessSector: string
    isEntityRegulated: boolean
    licenseNumber: string
    clientCountries: string
    relationshipPurpose: string
}

export interface UBOResponse {
    title: string
    fullname: string
    address: string
    shareholding: string
    nationality: string
}


export interface ShareholderResponse {
    name: string
    incorporationNumber: string
    address: string
    shareholding: string
    incorporationCountry: string
}

export function useGetShareholders(tradingPartnerId: string) {
    return useQuery<ShareholderItem[]>({
        queryKey: ['shareholders', tradingPartnerId],
        queryFn: () => getList<ShareholderItem>(`api/partner-shareholders?tradingPartnerId=${tradingPartnerId}`),
        enabled: !!tradingPartnerId,
    })
}

// ─── GET: Directors ───────────────────────────────────────────────────────────

export interface DirectorResponse {
    title: string
    fullname: string
    address: string
    dateOfBirth: string
    nationality: string
}

export function useGetDirectors(tradingPartnerId: string) {
    return useQuery<DirectorItem[]>({
        queryKey: ['directors', tradingPartnerId],
        queryFn: () => getList<DirectorItem>(`api/business-directors?tradingPartnerId=${tradingPartnerId}`),
        enabled: !!tradingPartnerId,
    })
}

export interface ContactDeclarationResponse {
    jobTitle: string
    fullname: string
    phoneNumber: string
    email: string
    companyName: string
    companyNumber: string
    contactPerson: string
    companyAddress: string
    date: string
}

export function useGetContactDeclaration(tradingPartnerId: string) {
    return useQuery<ContactDeclarationItem | null>({
        queryKey: ['contact-declaration', tradingPartnerId],
        queryFn: () => getOne<ContactDeclarationItem>(`api/contact-declarations/${tradingPartnerId}`),
        enabled: !!tradingPartnerId,
    })
}

export interface ValidateInviteResult {
    isValid: boolean;
    code: string;
    status: string;
    expiresAt?: string;
    reason?: string;
}

export function useValidateInvite(code: string) {
    return useQuery<ValidateInviteResult>({
        queryKey: ['validate-invite', code],
        queryFn: async () => {
            try {
                const res: ApiEnvelope = await apiClient(`api/onboarding/invites/${code}`);
                const d = res.data as ValidateInviteResult;
                return {
                    isValid: !res.hasErrors && d?.isValid !== false,
                    code: d?.code ?? code,
                    status: d?.status ?? '',
                    expiresAt: d?.expiresAt,
                    reason: d?.reason,
                };
            } catch {
                return { isValid: false, code, status: '', reason: 'Invalid or expired invite.' };
            }
        },
        enabled: !!code,
        retry: false,
    })
}

/** Shape of a single invite as returned by the API */
export interface InviteItem {
    code: string;
    inviteUrl: string;
    status: "Pending" | "Accepted" | "Expired" | "Revoked" | string;
    expiresAt: string;
    createdAt: string;
    acceptedAt?: string | null;
}

/** Paginated list query params */
export interface GetInvitesParams {
    Status?: string;
    PageNumber?: number;
    PageSize?: number;
}

export function useGetAllInvites(params?: GetInvitesParams) {
    const query = new URLSearchParams();
    if (params?.Status) query.set("Status", params.Status);
    if (params?.PageNumber) query.set("PageNumber", String(params.PageNumber));
    if (params?.PageSize) query.set("PageSize", String(params.PageSize));
    const qs = query.toString();
    return useQuery<InviteItem[]>({
        queryKey: ['all-invites', params],
        queryFn: () => getList<InviteItem>(`api/onboarding/invites${qs ? `?${qs}` : ""}`),
        retry: false,
    })
}

export function useCreateInvite() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: { expiryDays: number, email?: string }) =>
            post('api/onboarding/invites', payload as unknown as Record<string, JsonValue>),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-invites'] });
        },
    })
}

export interface RegisterPayload {
    inviteCode: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    businessType: string;
}

export function useRegisterInvite() {
    return useMutation({
        mutationFn: (payload: RegisterPayload) =>
            post('api/onboarding/register', payload as unknown as Record<string, JsonValue>),
    })
}

export interface PartnerLoginPayload {
    username: string;
    password: string;
}

export interface PartnerProfile {
    profileId: string;
    email: string;
    firstName: string;
    lastName: string;
    businessType: string;
    accountStatus: string;
    createdAt: string;
}

export interface PartnerRegistration {
    companyId: string;
    rcNumber: string;
    businessName: string;
    submissionStatus: string;
    approvalStatus: string;
    percentComplete: number;
}

export function usePartnerLogin() {
    return useMutation({
        mutationFn: async (payload: PartnerLoginPayload) => {
            const res = await post('api/onboarding/login', payload as unknown as Record<string, JsonValue>);
            return res as { 
                token?: { access_token: string; expires_in: number; token_type: string; scope: string }; 
                profile?: PartnerProfile;
                registration?: PartnerRegistration;
            };
        }
    })
}

export interface BasicInfoPayload {
  legalBusinessName: string;
  tradingName: string;
  businessType: string;
  countryOfIncorporation: string;
  dateOfIncorporation: string;
  registrationNumber: string;
  taxId: string;
  website: string;
}

export interface RegistrationInfo {
  companyId: string;
  profileId: string;
  rcNumber: string;
  legalBusinessName: string;
  tradingName: string;
  businessType: string;
  countryOfIncorporation: string;
  dateOfIncorporation: string;
  taxId: string;
  website: string;
  businessEmail: string;
  phoneCountryCode: string;
  phoneNumber: string;
  streetAddress: string;
  operatingCountry: string;
  operatingStreetAddress?: string;
  operatingState?: string;
  operatingCity?: string;
  operatingPostalCode?: string;
  state: string;
  city: string;
  postalCode: string;
  businessDescription: string;
  services?: string[];
  servicesRequested?: string[];
  digitalAssetsServices?: string[];
  digitalAssetServices?: string[];
  percentComplete: number;
  basicInfoCompleted: boolean;
  contactInfoCompleted: boolean;
  additionalDetailsCompleted: boolean;
  documentsCompleted: boolean;
  beneficialOwnersCompleted: boolean;
  submissionStatus?: string;
  approvalStatus?: string;
  reviewNote?: string;
  country?: string;
  primaryFundingSource?: string;
  otherFundingSource?: string;
  estimatedMonthlyVolume?: number;
  estimatedAnnualRevenue?: number;
  beneficialOwners?: Array<Record<string, unknown> & {
    id?: string;
    proofOfWealthUrl?: string;
    proofOfWealthStatus?: string;
    proofOfAddressUrl?: string;
    proofOfAddressStatus?: string;
  }>;
}

export function useLookupCompany() {
    return useMutation({
        mutationFn: async (rcNumber: string) => {
            const res = await apiClient(`api/registration/${rcNumber}`, { method: 'GET' });
            if (res.hasErrors) throw new Error(res.message || 'Company not found');
            return res as { data: RegistrationInfo; success: boolean; message: string };
        }
    })
}

export interface StartRegistrationForm {
    id?: string;
    rcNumber?: string;
    companyName?: string;
    email?: string;
    address?: string;
    state?: string;
    city?: string;
    natureOfBusiness?: string;
}

export interface StartRegistrationResponse {
    data?: {
        companyId?: string;
        status?: { companyId?: string };
        form?: StartRegistrationForm;
    };
    companyId?: string;
    status?: { companyId?: string };
    form?: StartRegistrationForm;
}

export function useStartRegistration() {
    return useMutation({
        mutationFn: async (payload: { rcNumber: string }) => {
            const res = await post('api/registration/start', payload as unknown as Record<string, JsonValue>);
            return res as StartRegistrationResponse;
        }
    })
}

export function useUpdateBasicInfo() {
    return useMutation({
        mutationFn: async ({ companyId, payload }: { companyId: string, payload: BasicInfoPayload }) => {
            const res = await apiClient(`api/registration/${companyId}/basic-info`, {
                method: 'POST',
                body: payload as unknown as Record<string, JsonValue>
            });
            if (res.hasErrors) throw new Error(res.message || 'Failed to update basic info');
            return res.data;
        }
    })
}

export interface ContactInfoPayload {
  businessEmail: string;
  phoneCountryCode: string;
  phoneNumber: string;
  streetAddress: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  operatingStreetAddress?: string;
  operatingCountry?: string;
  operatingState?: string;
  operatingCity?: string;
  operatingPostalCode?: string;
}

export function useUpdateContactInfo() {
    return useMutation({
        mutationFn: async ({ companyId, payload }: { companyId: string, payload: ContactInfoPayload }) => {
            const res = await apiClient(`api/registration/${companyId}/contact`, {
                method: 'POST',
                body: payload as unknown as Record<string, JsonValue>
            });
            if (res.hasErrors) throw new Error(res.message || 'Failed to update contact info');
            return res.data;
        }
    })
}

export interface AdditionalDetailsPayload {
  businessDescription: string;
  estimatedMonthlyVolume: number;
  estimatedAnnualRevenue: number;
  primaryFundingSource: string;
  otherFundingSource?: string;
  services?: string[];
  digitalAssetsServices?: string[];
}

export function useUpdateAdditionalDetails() {
    return useMutation({
        mutationFn: async ({ companyId, payload }: { companyId: string, payload: AdditionalDetailsPayload }) => {
            const res = await apiClient(`api/registration/${companyId}/additional-details`, {
                method: 'POST',
                body: payload as unknown as Record<string, JsonValue>
            });
            if (res.hasErrors) throw new Error(res.message || 'Failed to update additional details');
            return res.data;
        }
    })
}

export interface BeneficialOwnerPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  dateOfBirth: string;
  bvn: string;
  nationalIdNumber: string;
  ownershipPercentage: number;
  streetAddress: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  sourceOfWealth: string;
  isShareholder: boolean;
  isDirector: boolean;
  isLegalRepresentative: boolean;
}

export function useUpdateBeneficialOwners() {
    return useMutation({
        mutationFn: async ({ companyId, payload }: { companyId: string, payload: BeneficialOwnerPayload }) => {
            const res = await apiClient(`api/registration/${companyId}/beneficial-owners`, {
                method: 'POST',
                body: payload as unknown as Record<string, JsonValue>
            });
            if (res.hasErrors) throw new Error(res.message || 'Failed to update beneficial owners');
            return res.data;
        }
    })
}

export function useCompleteBeneficialOwners() {
    return useMutation({
        mutationFn: async (companyId: string) => {
            const res = await apiClient(`api/registration/${companyId}/beneficial-owners/complete`, { method: 'POST' });
            if (res.hasErrors) throw new Error(res.message || 'Failed to complete beneficial owners step');
            return res.data;
        }
    })
}

export function useVerifyBeneficialOwner() {
    return useMutation({
        mutationFn: async (shareholderId: string) => {
            const res = await apiClient(`api/registration/beneficial-owners/${shareholderId}/verify`, { method: 'POST' });
            if (res.hasErrors) throw new Error(res.message || 'Failed to generate verification link');
            return res.data;
        }
    })
}

export function useUploadRegistrationDocument() {
    return useMutation({
        mutationFn: async ({ companyId, formData }: { companyId: string, formData: FormData }) => {
            const res = await apiClient(`api/registration/${companyId}/documents`, {
                method: 'POST',
                body: formData
            });
            if (res.hasErrors) throw new Error(res.message || 'Failed to upload document');
            return res.data;
        }
    })
}

export function useCompleteDocuments() {
    return useMutation({
        mutationFn: async (companyId: string) => {
            const res = await apiClient(`api/registration/${companyId}/documents/complete`, { method: 'POST' });
            if (res.hasErrors) throw new Error(res.message || 'Failed to complete documents');
            return res.data;
        }
    })
}

export function useSubmitRegistration() {
    return useMutation({
        mutationFn: async (companyId: string) => {
            const res = await apiClient(`api/registration/${companyId}/submit`, { method: 'POST' });
            if (res.hasErrors) throw new Error(res.message || 'Failed to submit registration');
            return res.data;
        }
    })
}

export function useUploadShareholderDocument() {
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await apiClient(`api/respondents/shareholders/documents`, {
                method: 'POST',
                body: formData
            });
            if (res.hasErrors) throw new Error(res.message || 'Failed to upload document');
            return res.data;
        }
    })
}

