import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/tradingpartner-form', '/invite']
const ONBOARDING_PATH = '/onboarding-partner'

function isAppUser(token: string) {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        const payload = JSON.parse(jsonPayload)
        
        const userType = (payload.UserType as string | undefined)?.toLowerCase()
        const validRoles = [
            'approver', 'initiator', 'super admin', 'superadmin',
            'compliance', 'audit', 'treasurer', 'treasurer team',
            'marketers', 'marketer', 'business head', 'business team'
        ]
        if (userType && validRoles.includes(userType)) return true

        const roles: string[] = Array.isArray(payload.role)
            ? payload.role.map((r: string) => r.toLowerCase())
            : typeof payload.role === 'string'
                ? [payload.role.toLowerCase()]
                : []
                
        const validRoleSet = new Set([...validRoles, 'kyc_approver', 'kyc_initiator'])
        if (roles.some(r => validRoleSet.has(r))) return true

        return false
    } catch (e) {
        return false
    }
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))
    const tokenCookie = request.cookies.get('peniwyse_token')
    const hasToken = !!tokenCookie
    
    // Check if user is an admin/internal user or just an onboarding partner
    const isInternalUser = hasToken ? isAppUser(tokenCookie.value) : false

    // Unauthenticated user hitting a protected route → redirect to login
    if (!isPublic && !hasToken) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('next', pathname)
        return NextResponse.redirect(loginUrl)
    }
 
    if (hasToken) {
        if (!isInternalUser) {
            // Partner user
            if (isPublic) {
                // Partner hitting /login -> send to onboarding
                return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url))
            } else if (!pathname.startsWith(ONBOARDING_PATH)) {
                // Partner hitting any protected route EXCEPT onboarding -> send to onboarding
                return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url))
            }
        } else {
            // Internal/Admin user
            if (isPublic) {
                // Internal user hitting /login -> send to dashboard
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
            if (pathname.startsWith(ONBOARDING_PATH)) {
                // Internal user shouldn't be in onboarding -> send to dashboard
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match every path except:
         * - _next/static  (static assets)
         * - _next/image   (image optimisation)
         * - favicon.ico
         * - public files (images, fonts, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot|pdf)).*)',
    ],
}
