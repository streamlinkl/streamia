import { getMeServer } from '@/lib/api-server'

/**
 * Faz 3 placeholder: proves the (app) layout + middleware + cookie auth flow.
 * Real pages (Feed, Profile, Messages, …) port into this group from Faz 4 on.
 */
export default async function Dashboard() {
  const me = await getMeServer()
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-lt text-accent text-[11.5px] font-bold rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Next.js SSR — Faz 3 shell
        </div>
        <h1 className="text-2xl font-extrabold mb-1">You're in, {me?.profile?.displayName || me?.email}</h1>
        <p className="text-sm text-gray-500 mb-6">
          This page is rendered behind the auth-gated <code className="px-1 py-0.5 bg-gray-100 rounded text-[12px]">app/(app)/layout.jsx</code>.
          Middleware blocked the request at the edge if your <code className="px-1 py-0.5 bg-gray-100 rounded text-[12px]">sl_access</code> cookie was missing.
        </p>

        <dl className="grid grid-cols-2 gap-3 text-[12.5px]">
          {[
            ['User id', me?.id],
            ['Email', me?.email],
            ['Role', me?.role],
            ['Handle', me?.profile?.handle],
            ['Language', me?.profile?.language],
            ['Verified email', String(me?.emailVerified)],
          ].map(([k, v]) => (
            <div key={k} className="bg-bg border border-gray-100 rounded-lg p-3">
              <div className="text-[10.5px] font-extrabold text-gray-400 uppercase tracking-wider">{k}</div>
              <div className="font-bold mt-0.5 truncate">{v ?? '—'}</div>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
