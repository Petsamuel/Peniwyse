// Client-safe token helpers — no server-only imports.
// For server-side token access use auth.server.ts instead.

const TOKEN_KEY = 'peniwyse_token'

export function getClientToken(): string | null {
  if (typeof window === 'undefined') return null
  const name = TOKEN_KEY + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

export function setClientToken(token: string) {
  // Save to cookie with 7-day expiry
  const d = new Date();
  d.setTime(d.getTime() + (7*24*60*60*1000));
  const expires = "expires="+ d.toUTCString();
  document.cookie = `${TOKEN_KEY}=${token}; ${expires}; path=/; SameSite=Lax`;
}

export function clearClientToken() {
  // Expire the cookie
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

