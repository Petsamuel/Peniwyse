// Shared auth routing rules — used by the proxy (edge) and by client pages.
// Keep this file free of Node/Next imports so both runtimes can consume it.

export const PUBLIC_PATHS = ['/login', '/tradingpartner-form', '/invite']
export const ONBOARDING_PATH = '/onboarding-partner'
export const DASHBOARD_PATH = '/dashboard'

const INTERNAL_USER_TYPES = [
    'approver', 'initiator', 'super admin', 'superadmin',
    'compliance', 'audit', 'treasurer', 'treasurer team',
    'marketers', 'marketer', 'business head', 'business team',
]

const INTERNAL_ROLES = new Set([...INTERNAL_USER_TYPES, 'kyc_approver', 'kyc_initiator'])

export function isPublicPath(pathname: string) {
    return PUBLIC_PATHS.some(p => pathname.startsWith(p))
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
        return JSON.parse(jsonPayload)
    } catch {
        return null
    }
}

/** True for staff/admin tokens; false for onboarding partners and unreadable tokens. */
export function isInternalUser(token: string) {
    const payload = decodeJwtPayload(token)
    if (!payload) return false

    const userType = (payload.UserType as string | undefined)?.toLowerCase()
    if (userType && INTERNAL_USER_TYPES.includes(userType)) return true

    const rawRole = payload.role
    const roles: string[] = Array.isArray(rawRole)
        ? rawRole.map((r: string) => r.toLowerCase())
        : typeof rawRole === 'string'
            ? [rawRole.toLowerCase()]
            : []

    return roles.some(r => INTERNAL_ROLES.has(r))
}

/** Where a signed-in user belongs when they have no specific destination. */
export function getHomePath(token: string) {
    return isInternalUser(token) ? DASHBOARD_PATH : ONBOARDING_PATH
}

/**
 * Resolves where to send a signed-in user, honouring a `?next=` hint when it is
 * a safe, same-origin path the user is actually allowed to reach.
 */
export function resolveAuthedDestination(token: string, next?: string | null) {
    const home = getHomePath(token)
    if (!next) return home

    // Same-origin absolute paths only — no `//evil.com` or `https://…`.
    if (!next.startsWith('/') || next.startsWith('//')) return home
    if (isPublicPath(next)) return home

    const internal = isInternalUser(token)
    if (internal && next.startsWith(ONBOARDING_PATH)) return home
    if (!internal && !next.startsWith(ONBOARDING_PATH)) return home

    return next
}
