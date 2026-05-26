import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BadgeCheck, Eye, MapPin, Users, Zap } from 'lucide-react'
import { apiServer } from '@/lib/api-server'

// 2-minute ISR — public profiles are read-heavy; this keeps avatar/banner
// edits visible within a couple of minutes while still serving from the
// edge cache.
export const revalidate = 120

async function loadProfile(handle) {
  try {
    return await apiServer.get(`/api/profiles/handle/${handle}`)
  } catch (err) {
    // Treat both "not found" and any auth-style error as "no public profile".
    // Public-profile pages should never crash because of an auth glitch.
    if (err?.status === 404 || err?.status === 401 || err?.status === 403) return null
    throw err
  }
}

export async function generateMetadata({ params }) {
  const handle = String(params.handle || '').toLowerCase()
  const p = await loadProfile(handle).catch(() => null)
  if (!p) return { title: 'Profile not found' }

  // Plain title; root layout's template appends " · StreamLink".
  const title = `${p.displayName} (@${p.handle})`
  const description =
    p.bio?.slice(0, 160) ||
    `Follow ${p.displayName} on StreamLink — ${p.category || 'creator profile'}.`

  const image = p.bannerUrl || p.avatarUrl || undefined

  return {
    title,
    description,
    openGraph: {
      title: `${title} · StreamLink`,
      description,
      url: `https://streamia.co/u/${p.handle}`,
      siteName: 'StreamLink',
      type: 'profile',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: `${title} · StreamLink`,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function PublicProfilePage({ params }) {
  const handle = String(params.handle || '').toLowerCase()
  const profile = await loadProfile(handle)
  if (!profile) notFound()

  const initials = (profile.displayName || '??').slice(0, 2).toUpperCase()

  return (
    <main className="min-h-screen bg-bg">
      <nav className="bg-white/85 backdrop-blur border-b border-gray-100">
        <div className="max-w-3xl mx-auto h-16 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight">
            <span className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center text-white">
              <Zap className="w-4 h-4" strokeWidth={2.5} />
            </span>
            Stream<span className="text-accent">Link</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/login" className="px-3 py-1.5 text-[13.5px] font-semibold text-gray-600 hover:text-gray-900 transition">Sign in</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white text-[13px] font-bold rounded-full transition">
              Join free <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="relative h-44 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200">
            {profile.bannerUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
          </div>
          <div className="px-6 pb-6">
            <div className="-mt-10 mb-3">
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-extrabold text-2xl">
                {profile.avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : initials}
              </div>
            </div>
            <h1 className="text-[22px] font-extrabold inline-flex items-center gap-2">
              {profile.displayName}
              {profile.isVerified && <BadgeCheck className="w-5 h-5 text-sky-500" fill="currentColor" strokeWidth={0} />}
              {profile.isLive && <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full">LIVE</span>}
            </h1>
            <div className="flex items-center flex-wrap gap-x-1.5 text-[13px] text-gray-400 mb-2">
              <span>@{profile.handle}</span>
              {profile.category && <span>· {profile.category}</span>}
              {profile.location && (
                <span className="inline-flex items-center gap-1">
                  · <MapPin className="w-3 h-3" strokeWidth={2.5} /> {profile.location}
                </span>
              )}
            </div>
            {profile.bio && <p className="text-[14px] text-gray-600 leading-relaxed max-w-xl">{profile.bio}</p>}

            {profile.contentCategories?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.contentCategories.map((cat) => (
                  <span key={cat} className="inline-flex items-center px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full text-[11px] font-bold">{cat}</span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-6 mt-5 pt-5 border-t border-gray-100">
              <div className="inline-flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gray-400" strokeWidth={2.25} />
                <span className="text-[13px] font-extrabold">{(profile.followersCount ?? 0).toLocaleString()}</span>
                <span className="text-[12px] text-gray-400">followers</span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <span className="text-[13px] font-extrabold">{(profile.connectionsCount ?? 0).toLocaleString()}</span>
                <span className="text-[12px] text-gray-400">connections</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-[13.5px] transition">
                Connect on StreamLink
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold rounded-full text-[13.5px] transition">
                <Eye className="w-4 h-4" strokeWidth={2.25} /> View full profile
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[11.5px] text-gray-400 text-center">
          This is a public preview. Sign in to see posts, schedule and full stats.
        </p>
      </article>
    </main>
  )
}
