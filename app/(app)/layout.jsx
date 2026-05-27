import { redirect } from 'next/navigation'
import { getMeServer } from '@/lib/api-server'
import AppShell from './AppShell'

/**
 * Layout for every authed page. Runs on the server, so unauthenticated users
 * are redirected BEFORE any client JS ships. The edge middleware already
 * blocks at the request-level — this is the second line of defence (catches
 * cases where a stale cookie passes the cookie-presence check but the API
 * rejects it as expired/invalid).
 *
 * Anything inside `app/(app)/*` (URL: anything not in the parens) inherits
 * this layout, including its server-side `me` fetch.
 */
export default async function AppLayout({ children }) {
  const me = await getMeServer()
  if (!me) redirect('/login')

  return <AppShell me={me}>{children}</AppShell>
}
