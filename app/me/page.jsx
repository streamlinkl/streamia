import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getMeServer } from '@/lib/api-server'

/**
 * Proof that SSR sees the user's auth cookie. Renders the user's profile
 * on the server — no client-side fetch needed for the initial paint.
 */
export default async function MePage() {
  const me = await getMeServer()
  if (!me) redirect('/login')

  const initials = (me.profile?.displayName || '??').slice(0, 2).toUpperCase()

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-md p-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-lt text-accent text-[11.5px] font-bold rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Server-rendered with cookie auth
        </div>
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-extrabold text-2xl shadow-md overflow-hidden mb-3">
          {me.profile?.avatarUrl
            ? <img src={me.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            : initials}
        </div>
        <h1 className="text-xl font-extrabold">{me.profile?.displayName || '—'}</h1>
        <p className="text-sm text-gray-400">@{me.profile?.handle} · {me.email}</p>
        <p className="text-[11.5px] text-gray-400 mt-3">role: <span className="font-bold text-gray-700">{me.role}</span></p>
        <Link href="/login" className="inline-block mt-5 text-[12.5px] font-bold text-accent hover:underline">Back to login</Link>
      </div>
    </main>
  )
}
