import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
    ONBOARDING_PATH,
    isInternalUser,
    isPublicPath,
    resolveAuthedDestination,
} from '@/app/utils/auth-routing'

function applySecurityHeaders(response: NextResponse) {
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "connect-src 'self' https: ",
      "media-src 'self' blob:",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; ")
  );

  response.headers.set("X-Frame-Options", "same-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  response.headers.set(
    "Permissions-Policy",
    "accelerometer=(), autoplay=(), camera=(), display-capture=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(self), usb=()"
  );

  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  response.headers.set(
    "Cross-Origin-Opener-Policy",
    "same-origin"
  );

  response.headers.set(
    "Cross-Origin-Resource-Policy",
    "same-origin"
  );

  // Auth state is decided per request, so no page may be replayed from a
  // history/back-forward cache. Without this the browser can restore the login
  // page after a successful sign-in (or a protected page after logout) without
  // ever asking the server, so none of the redirects below get a chance to run.
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");

  return response;
}

function secureNext() {
  return applySecurityHeaders(NextResponse.next());
}

function secureRedirect(url: URL) {
  return applySecurityHeaders(NextResponse.redirect(url));
}

export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl

    const isPublic = isPublicPath(pathname)
    const tokenCookie = request.cookies.get('peniwyse_token')
    const hasToken = !!tokenCookie

    // Check if user is an admin/internal user or just an onboarding partner
    const isInternal = hasToken ? isInternalUser(tokenCookie.value) : false

    // Unauthenticated user hitting a protected route → redirect to login
    if (!isPublic && !hasToken) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('next', pathname)
        return secureRedirect(loginUrl)
    }

    if (hasToken) {
        if (isPublic) {
            // Already signed in — never show a public/auth page again. Honour the
            // `next` hint the login redirect carried so back/forward lands somewhere
            // useful instead of on the login form.
            const next = new URLSearchParams(search).get('next')
            const destination = resolveAuthedDestination(tokenCookie.value, next)
            return secureRedirect(new URL(destination, request.url))
        }

        if (!isInternal && !pathname.startsWith(ONBOARDING_PATH)) {
            // Partner hitting any protected route EXCEPT onboarding -> send to onboarding
            return secureRedirect(new URL(ONBOARDING_PATH, request.url))
        }

        if (isInternal && pathname.startsWith(ONBOARDING_PATH)) {
            // Internal user shouldn't be in onboarding -> send to dashboard
            return secureRedirect(new URL('/dashboard', request.url))
        }
    }

    return secureNext()
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
