'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3, Bell, Briefcase, Building2, Crown, Gem, Home, LogOut,
  MessageSquare, Search, Settings, ShieldCheck, Star, Trophy, User, Users, Zap,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import Toast from '@/components/Toast'
import NotificationBell from '@/components/NotificationBell'

const NAV = [
  { href: '/feed',        Icon: Home,          label: 'Home' },
  { href: '/network',     Icon: Users,         label: 'Network' },
  { href: '/jobs',        Icon: Briefcase,     label: 'Jobs' },
  { href: '/messages',    Icon: MessageSquare, label: 'Messages' },
  { href: '/leaderboard', Icon: Trophy,        label: 'Top' },
  { href: '/reviews',     Icon: Star,          label: 'Reviews' },
  { href: '/analytics',   Icon: BarChart3,     label: 'Stats' },
  { href: '/companies',   Icon: Building2,     label: 'Brands' },
  { href: '/pricing',     Icon: Gem,           label: 'Upgrade' },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.streamia.co'

export default function AppShell({ me, children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)
  const hydrate = useAuthStore((s) => s.hydrate)

  // Push the SSR-fetched user into the client-side Zustand store so
  // every page below doesn't have to re-fetch /auth/me.
  useEffect(() => { hydrate(me) }, [hydrate, me])

  const profile = me?.profile
  const initials = (profile?.displayName || me?.email || '??').slice(0, 2).toUpperCase()
  const isAdmin = me?.role === 'admin'

  const signOut = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: '{}',
      })
    } catch { /* ignore */ }
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 h-14 hidden md:flex items-center px-4 gap-2">
        <Link href="/feed" className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight flex-shrink-0">
          <span className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white">
            <Zap className="w-4 h-4" strokeWidth={2.5} />
          </span>
          Stream<span className="text-accent">Link</span>
        </Link>

        <div className="relative flex-1 max-w-[240px] ml-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" strokeWidth={2.25} />
          <input type="text" placeholder="Search…"
            className="w-full h-[34px] bg-bg border border-transparent rounded-full pl-8 pr-3 text-[13px] outline-none focus:bg-white focus:border-accent transition" />
        </div>

        <div className="flex items-center gap-px ml-auto">
          {NAV.map(({ href, Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 text-[10.5px] font-bold transition
                  ${active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}>
                <Icon className="w-[18px] h-[18px]" strokeWidth={2.25} />
                <span>{label}</span>
                {active && <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-gray-900 rounded" />}
              </Link>
            )
          })}

          <div className="ml-1">
            <NotificationBell />
          </div>

          {/* Profile pill + dropdown */}
          <div className="relative ml-1">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white text-[11.5px] font-extrabold overflow-hidden">
              {profile?.avatarUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                : initials}
            </button>
            {showMenu && (
              <div className="absolute right-0 top-11 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-[13.5px] font-extrabold truncate">{profile?.displayName || me?.email}</div>
                  <div className="text-[11px] text-gray-400 truncate">@{profile?.handle ?? '—'}</div>
                </div>
                <MenuItem Icon={User} onClick={() => { router.push('/profile'); setShowMenu(false) }}>My Profile</MenuItem>
                <MenuItem Icon={BarChart3} onClick={() => { router.push('/analytics'); setShowMenu(false) }}>Stats</MenuItem>
                <MenuItem Icon={Building2} onClick={() => { router.push('/companies'); setShowMenu(false) }}>Brands</MenuItem>
                <MenuItem Icon={Crown} onClick={() => { router.push('/pricing'); setShowMenu(false) }}>Upgrade</MenuItem>
                <MenuItem Icon={Settings} onClick={() => { router.push('/settings'); setShowMenu(false) }}>Settings</MenuItem>
                {isAdmin && <MenuItem Icon={ShieldCheck} onClick={() => { router.push('/admin'); setShowMenu(false) }}>Admin</MenuItem>}
                <div className="border-t border-gray-100">
                  <MenuItem Icon={LogOut} danger onClick={signOut}>Sign out</MenuItem>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile shrunk top bar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 h-12 flex md:hidden items-center px-3 gap-2">
        <Link href="/feed" className="flex items-center gap-2 text-[15px] font-extrabold tracking-tight">
          <span className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center text-white">
            <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
          </span>
          Stream<span className="text-accent">Link</span>
        </Link>
        <button onClick={signOut} className="ml-auto text-[11.5px] font-semibold text-gray-500">Sign out</button>
      </nav>

      <main>{children}</main>
      <Toast />
    </>
  )
}

function MenuItem({ Icon, children, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold transition
        ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}>
      <Icon className="w-4 h-4" strokeWidth={2.25} />
      {children}
    </button>
  )
}
