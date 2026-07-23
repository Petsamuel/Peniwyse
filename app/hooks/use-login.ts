import { useMutation } from '@tanstack/react-query'
import { setClientToken } from '@/app/utils/auth'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginPayload {
    username: string
    password: string
}

interface TokenDetails {
    access_token: string
    expires_in: number
    token_type: string
    scope: string
}

interface Profile {
    id: string
    firstName: string
    lastName: string
    otherName: string | null
    email: string
    username: string | null
    userType: string
    status: string
    roles: string[]
}

interface LoginResponseData {
    tokenDetails: TokenDetails
    profile: Profile
}

interface LoginResponse {
    data: LoginResponseData
    isSuccessful: boolean
    message: string
    code: string
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const AUTH_BASE = 'https://smartuser-dev.digitvant.com'

export function useLogin() {
    return useMutation({
        mutationFn: async (payload: LoginPayload): Promise<LoginResponse> => {
            const res = await fetch(`${AUTH_BASE}/api/v1/authentication/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const text = await res.text()
                let errorMessage = 'Login failed. Please check your credentials.'
                try {
                    const parsed = JSON.parse(text)
                    if (parsed && parsed.message) {
                        errorMessage = parsed.message
                    } else if (text) {
                        errorMessage = text
                    }
                } catch (e) {
                    if (text) errorMessage = text
                }
                throw new Error(errorMessage)
            }

            const json: LoginResponse = await res.json()

            if (!json.isSuccessful) {
                throw new Error(json.message || 'Login failed.')
            }

            return json
        },
        onSuccess: (data) => {
            // Store the JWT — apiClient and RoleProvider both read from here
            setClientToken(data.data.tokenDetails.access_token)
        },
    })
}
