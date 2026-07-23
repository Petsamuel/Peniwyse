import { cookies } from 'next/headers'

const TOKEN_KEY = 'peniwyse_token'

export async function getServerToken() {
  const cookieStore = await cookies()
  return cookieStore.get(TOKEN_KEY)?.value
}
