'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { getClientToken } from '../utils/auth'
import { clearClientToken } from '../utils/auth'
import { MdLock, MdLogout } from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'


export type Role = 
    | 'initiator' 
    | 'approver' 
    | 'Super Admin'
    | 'Compliance'
    | 'Audit'
    | 'Treasurer'
    | 'Treasurer Team'
    | 'Marketers'
    | 'Business Head'
    | 'Business Team'
    |'Marketer'


export const ALL_ROLES: Role[] = [
    'initiator',
    'approver',
    'Super Admin',
    'Compliance',
    'Audit',
    'Treasurer',
    'Treasurer Team',
    'Marketers',
    'Business Head',
    'Business Team',
    'Marketer'
]

export const ROLES = {
    INITIATOR: 'initiator' as Role,
    APPROVER: 'approver' as Role,
    SUPER_ADMIN: 'Super Admin' as Role,
    COMPLIANCE: 'Compliance' as Role,
    AUDIT: 'Audit' as Role,
    TREASURER: 'Treasurer' as Role,
    TREASURER_TEAM: 'Treasurer Team' as Role,
    MARKETERS: 'Marketers' as Role,
    BUSINESS_HEAD: 'Business Head' as Role,
    BUSINESS_TEAM: 'Business Team' as Role,
    MARKETER: 'Marketer' as Role,
}


interface RoleContextValue {
    role: Role
    setRole: (role: Role) => void
    claims: JwtClaims
    isLoading: boolean
    /** Call after storing a new token to sync role + claims without a page reload. */
    refreshFromToken: () => void
}

const RoleContext = createContext<RoleContextValue>({
    role: 'initiator',
    setRole: () => {},
    claims: {},
    isLoading: true,
    refreshFromToken: () => {},
})

const ROLE_KEY = 'peniwyse_role'

// Role arrays from the token that map to each app role.
const APPROVER_ROLES = ['kyc_approver', 'approver']
const INITIATOR_ROLES = ['kyc_initiator', 'initiator']

/**
 * Derives the app role from the stored JWT.
 *
 * Resolution order:
 *   1. `UserType` claim  — "Approver" | "Initiator"  (primary signal)
 *   2. `role` claim      — string | string[]          (fallback)
 */
function readRoleFromJwt(): Role | null {
    try {
        const token = getClientToken()
        if (!token) return null


        const payload = JSON.parse(atob(token.split('.')[1]))

        // 1. UserType claim (most explicit)
        const userType = (payload.UserType as string | undefined)?.toLowerCase()
        if (userType === 'approver') return 'approver'
        if (userType === 'initiator') return 'initiator'
        if (userType === 'super admin' || userType === 'superadmin') return 'Super Admin'
        if (userType === 'compliance') return 'Compliance'
        if (userType === 'audit') return 'Audit'
        if (userType === 'treasurer') return 'Treasurer'
        if (userType === 'treasurer team') return 'Treasurer Team'
        if (userType === 'marketers' || userType === 'marketer') return ROLES.MARKETER

        if (userType === 'business head') return 'Business Head'
        if (userType === 'business team') return 'Business Team'
        

        // 2. role claim — may be a string or an array
        const roles: string[] = Array.isArray(payload.role)
            ? payload.role.map((r: string) => r.toLowerCase())
            : typeof payload.role === 'string'
                ? [payload.role.toLowerCase()]
                : []

        if (roles.some(r => APPROVER_ROLES.includes(r))) return 'approver'
        if (roles.some(r => INITIATOR_ROLES.includes(r))) return 'initiator'
        if (roles.includes('super admin') || roles.includes('superadmin')) return 'Super Admin'
        if (roles.includes('compliance')) return 'Compliance'
        if (roles.includes('audit')) return 'Audit'
        if (roles.includes('treasurer')) return 'Treasurer'
        if (roles.includes('treasurer team')) return 'Treasurer Team'
        if (roles.includes('marketers') || roles.includes('marketer')) return ROLES.MARKETER
        if (roles.includes('business head')) return 'Business Head'
        if (roles.includes('business team')) return 'Business Team'

    } catch {
        // malformed token — fall through
    }
    return null
}

/** Exposes selected decoded claims for use across the app. */
export interface JwtClaims {
    sub?: string
    name?: string
    email?: string
    fullName?: string
    userType?: string
    roles?: string[]
    permissions?: string[]
}

export function decodeJwtClaims(): JwtClaims {
    try {
        const token = getClientToken()
        if (!token) return {}

        const payload = JSON.parse(atob(token.split('.')[1]))
        return {
            sub: payload.sub,
            name: payload.name,
            email: payload.email,
            fullName: payload.Us_FullName,
            userType: payload.UserType,
            roles: Array.isArray(payload.role) ? payload.role : payload.role ? [payload.role] : [],
            permissions: Array.isArray(payload.permission) ? payload.permission : [],
        }
    } catch {
        return {}
    }
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState(() => {
        return {
            role: 'initiator' as Role,
            claims: {} as JwtClaims,
            isLoading: true,
            isUnauthorized: false,
        }
    })
    const pathname = usePathname()

    useEffect(() => {
        const initializeAuth = async () => {
            let initialRole: Role = 'initiator'
            let initialUnauthorized = false
            let initialClaims: JwtClaims = {}

            if (typeof window !== 'undefined') {
                const fromJwt = readRoleFromJwt()
                const hasToken = !!getClientToken()

                if (fromJwt) {
                    initialRole = fromJwt
                    localStorage.setItem(ROLE_KEY, fromJwt)
                } else if (!hasToken) {
                    const stored = localStorage.getItem(ROLE_KEY) as Role | null
                    if (stored) initialRole = stored
                } else {
                    initialUnauthorized = true
                }
                initialClaims = decodeJwtClaims()
            }

            setState({
                role: initialRole,
                claims: initialClaims,
                isLoading: false,
                isUnauthorized: initialUnauthorized,
            })
        }

        initializeAuth()
    }, [])

    const setRole = useCallback((r: Role) => {
        setState(prev => ({ ...prev, role: r }))
        if (typeof window !== 'undefined') localStorage.setItem(ROLE_KEY, r)
    }, [])

    const refreshFromToken = useCallback(() => {
        const fromJwt = readRoleFromJwt()
        const hasToken = !!getClientToken()
        
        setState(prev => {
            let newRole = prev.role;
            let newUnauthorized = false;

            if (fromJwt) {
                newRole = fromJwt;
            } else if (hasToken) {
                newUnauthorized = true;
            }

            return {
                ...prev,
                role: newRole,
                isUnauthorized: newUnauthorized,
                claims: decodeJwtClaims()
            };
        });
    }, [])

    const handleLogout = useCallback(() => {
        clearClientToken()
        localStorage.removeItem(ROLE_KEY)
        window.location.href = '/login'
    }, [])

    const isBypassedRoute = pathname?.startsWith('/onboarding') || pathname?.startsWith('/invite') || pathname?.startsWith('/login');
    const showUnauthorizedModal = state.isUnauthorized && !isBypassedRoute;

    const value = useMemo(() => ({
        role: state.role,
        setRole,
        claims: state.claims,
        isLoading: state.isLoading,
        refreshFromToken
    }), [state.role, state.claims, state.isLoading, setRole, refreshFromToken]);

    return (
        <RoleContext.Provider value={value}>
            {children}

            <AnimatePresence>
                {showUnauthorizedModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-card-bg rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <MdLock size={40} />
                                </div>
                                <h2 className="text-2xl font-black text-foreground mb-2 tracking-tight">Access Restricted</h2>
                                <p className="text-muted-theme text-sm leading-relaxed mb-8">
                                    Your account is authenticated, but you do not have an assigned role for this portal. 
                                    Please contact your administrator to gain access.
                                </p>
                                <button 
                                    onClick={handleLogout}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 group"
                                >
                                    <MdLogout size={18} className="group-hover:-translate-x-1 transition-transform" />
                                    Logout and Retry
                                </button>
                            </div>
                            <div className="bg-surface-hover py-4 px-8 border-t border-border-theme">
                                <p className="text-[10px] text-muted-theme font-bold uppercase tracking-widest text-center">
                                    TradeBlotter Security Protocol
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </RoleContext.Provider>
    )
}


export function useRole() {
    return useContext(RoleContext)
}

/**
 * Permission helpers derived from the token's `permission` claim.
 *
 * Rules:
 *   canApproveReject — has "New-Update" or "HeadOperation" permission
 *   canAddPartner    — has "New-Update" or "HeadOperation" permission
 *   isViewOnly       — has "View" but lacks the above write permissions
 */
export function usePermissions() {
    const { claims } = useRole()
    const perms = (claims.permissions ?? []).map(p => p.toLowerCase())

    const canApproveReject = perms.includes('new-update') || perms.includes('headoperation')
    const canAddPartner    = perms.includes('new-update') || perms.includes('headoperation')
    const isViewOnly       = !canApproveReject

    return { permissions: claims.permissions ?? [], canApproveReject, canAddPartner, isViewOnly }
}
