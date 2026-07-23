import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/app/utils/api-client'

export interface DocumentType {
    id: string
    name: string
    required?: boolean
    description?: string | null
}

interface ApiEnvelope<T> {
    data: T
    success: boolean
    code: string
    message: string
    errors: string[]
    hasErrors: boolean
}

export const documentTypeKeys = {
    all: ['document-types'] as const,
    detail: (id: string) => ['document-types', id] as const,
}

export function useDocumentTypes() {
    return useQuery<DocumentType[]>({
        queryKey: documentTypeKeys.all,
        queryFn: async () => {
            const res: ApiEnvelope<DocumentType[]> = await apiClient('api/document-types')
            return res.data
        },
    })
}

export function useDocumentType(id: string) {
    return useQuery<DocumentType>({
        queryKey: documentTypeKeys.detail(id),
        queryFn: async () => {
            const res: ApiEnvelope<DocumentType> = await apiClient(`api/document-types/${id}`)
            return res.data
        },
        enabled: !!id,
    })
}

export function useCreateDocumentType() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (name: string) =>
            apiClient('api/document-types', { body: { name } }),
        onSuccess: () => qc.invalidateQueries({ queryKey: documentTypeKeys.all }),
    })
}

export function useUpdateDocumentType() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) =>
            apiClient('api/document-types', {
                method: 'PUT',
                body: { id, name },
            }),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: documentTypeKeys.all })
            qc.invalidateQueries({ queryKey: documentTypeKeys.detail(id) })
        },
    })
}

export function useDeleteDocumentType() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) =>
            apiClient(`api/document-types/${id}`, { method: 'DELETE' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: documentTypeKeys.all }),
    })
}
