'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3, Bell, Briefcase, Building2, Crown, Gem, Home, Loader2, LogOut, Menu,
  MessageSquare, Search, Settings, ShieldCheck, Star, Trophy, User, Users, X, Headphones,
} from 'lucide-react'
import { profileApi } from '@/lib/api-client'
import { useAuthStore } from '@/lib/store'
import Toast from '@/components/Toast'
import SupportDialog from '@/components/SupportDialog'
import NotificationBell from '@/components/NotificationBell'
import PremiumBadge from '@/components/PremiumBadge'

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
  const [showDrawer, setShowDrawer] = useState(false)
  const hydrate = useAuthStore((s) => s.hydrate)

  // Push the SSR-fetched user into the client-side Zustand store so
  // every page below doesn't have to re-fetch /auth/me.
  useEffect(() => { hydrate(me) }, [hydrate, me])

  // ── Block E — functional nav search ──
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchWrapRef = useRef(null)
  const searchWrapRefMobile = useRef(null)

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return }
    let cancelled = false
    setSearching(true)
    const handle = setTimeout(async () => {
      try {
        const list = await profileApi.search(q.trim(), 6)
        if (!cancelled) setResults(list || [])
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, 220) // debounce
    return () => { cancelled = true; clearTimeout(handle) }
  }, [q])

  // Close dropdown on outside-click.
  useEffect(() => {
    if (!showSearchDropdown) return
    const onClick = (e) => {
      const inDesktop = searchWrapRef.current?.contains(e.target)
      const inMobile = searchWrapRefMobile.current?.contains(e.target)
      if (!inDesktop && !inMobile) setShowSearchDropdown(false)
    }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [showSearchDropdown])

  const profile = me?.profile
  const initials = (profile?.displayName || me?.email || '??').slice(0, 2).toUpperCase()
  const [showSupport, setShowSupport] = useState(false)
  const closeSupport = useCallback(() => setShowSupport(false), [])
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
        <Link href="/feed" aria-label="StreamLink — feed" className="flex items-center flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/icon.svg" alt="StreamLink" className="h-9 w-auto" />
        </Link>

        <div className="relative flex-1 max-w-[260px] ml-2" ref={searchWrapRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" strokeWidth={2.25} />
          <input
            type="text"
            placeholder="Search creators…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setShowSearchDropdown(true) }}
            onFocus={() => setShowSearchDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setShowSearchDropdown(false); setQ('') }
              if (e.key === 'Enter' && results[0]) { router.push(`/profile/${results[0].id}`); setShowSearchDropdown(false); setQ('') }
            }}
            className="w-full h-[34px] bg-bg border border-transparent rounded-full pl-8 pr-3 text-[13px] outline-none focus:bg-white focus:border-accent transition"
          />
          {showSearchDropdown && q.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-[42px] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
              {searching && (
                <div className="flex items-center justify-center py-4 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                </div>
              )}
              {!searching && results.length === 0 && (
                <div className="text-center py-4 text-[12px] text-gray-400">No matches.</div>
              )}
              {!searching && results.map((p) => {
                const initials = (p.displayName || '??').slice(0, 2).toUpperCase()
                return (
                  <Link
                    key={p.id}
                    href={`/profile/${p.id}`}
                    onClick={() => { setShowSearchDropdown(false); setQ('') }}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-graduate-radial flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
                      {p.avatarUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                        : initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-extrabold flex items-center gap-1 min-w-0">
                        <span className="truncate">{p.displayName}</span>
                        {p.isVerified && <PremiumBadge size={12} />}
                      </div>
                      <div className="text-[10.5px] text-gray-400 truncate">@{p.handle}{p.category ? ` · ${p.category}` : ''}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
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
              className="w-9 h-9 rounded-full bg-graduate-radial flex items-center justify-center text-white text-[11.5px] font-extrabold overflow-hidden">
              {profile?.avatarUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                : initials}
            </button>
            {showMenu && (
              <div className="absolute right-0 top-11 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-[13.5px] font-extrabold flex items-center gap-1 min-w-0">
                    <span className="truncate">{profile?.displayName || me?.email}</span>
                    {profile?.isVerified && <PremiumBadge size={13} />}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate">@{profile?.handle ?? '—'}</div>
                </div>
                <MenuItem Icon={User} onClick={() => { router.push('/profile'); setShowMenu(false) }}>My Profile</MenuItem>
                <MenuItem Icon={BarChart3} onClick={() => { router.push('/analytics'); setShowMenu(false) }}>Stats</MenuItem>
                <MenuItem Icon={Building2} onClick={() => { router.push('/companies'); setShowMenu(false) }}>Brands</MenuItem>
                <MenuItem Icon={Crown} onClick={() => { router.push('/pricing'); setShowMenu(false) }}>Upgrade</MenuItem>
                <MenuItem Icon={Settings} onClick={() => { router.push('/settings'); setShowMenu(false) }}>Settings</MenuItem>
                <MenuItem Icon={Headphones} onClick={() => { setShowSupport(true); setShowMenu(false) }}>Customer Support</MenuItem>
                {isAdmin && <MenuItem Icon={ShieldCheck} onClick={() => { router.push('/admin'); setShowMenu(false) }}>Admin</MenuItem>}
                <div className="border-t border-gray-100">
                  <MenuItem Icon={LogOut} danger onClick={signOut}>Sign out</MenuItem>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile top bar — hamburger · centered logo · bell + avatar, with search below (app-style) */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 md:hidden">
        <nav className="relative h-14 flex items-center px-3">
          <button
            onClick={() => setShowDrawer(true)}
            aria-label="Menu"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
            <Menu className="w-5 h-5" strokeWidth={2.25} />
          </button>

          <Link href="/feed" aria-label="StreamLink — feed" className="absolute left-1/2 -translate-x-1/2 flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/icon.svg" alt="StreamLink" className="h-8 w-auto" />
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            <NotificationBell />
            <Link
              href="/profile"
              aria-label="My profile"
              className="w-9 h-9 rounded-full bg-graduate-radial flex items-center justify-center text-white text-[11.5px] font-extrabold overflow-hidden">
              {profile?.avatarUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                : initials}
            </Link>
          </div>
        </nav>

        <div className="px-3 pb-2.5" ref={searchWrapRefMobile}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2.25} />
            <input
              type="text"
              placeholder="Search creators…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setShowSearchDropdown(true) }}
              onFocus={() => setShowSearchDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setShowSearchDropdown(false); setQ('') }
                if (e.key === 'Enter' && results[0]) { router.push(`/profile/${results[0].id}`); setShowSearchDropdown(false); setQ('') }
              }}
              className="w-full h-10 bg-bg border border-transparent rounded-full pl-9 pr-3 text-[13.5px] outline-none focus:bg-white focus:border-accent transition"
            />
            {showSearchDropdown && q.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-[46px] z-50 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                {searching && (
                  <div className="flex items-center justify-center py-4 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                  </div>
                )}
                {!searching && results.length === 0 && (
                  <div className="text-center py-4 text-[12px] text-gray-400">No matches.</div>
                )}
                {!searching && results.map((p) => {
                  const ini = (p.displayName || '??').slice(0, 2).toUpperCase()
                  return (
                    <Link key={p.id} href={`/profile/${p.id}`}
                      onClick={() => { setShowSearchDropdown(false); setQ('') }}
                      className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition">
                      <div className="w-8 h-8 rounded-full bg-graduate-radial flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
                        {p.avatarUrl
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                          : ini}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-extrabold flex items-center gap-1 min-w-0">
                        <span className="truncate">{p.displayName}</span>
                        {p.isVerified && <PremiumBadge size={12} />}
                      </div>
                        <div className="text-[10.5px] text-gray-400 truncate">@{p.handle}{p.category ? ` · ${p.category}` : ''}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer (hamburger) */}
      {showDrawer && (
        <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setShowDrawer(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[82%] bg-white shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <div className="w-11 h-11 rounded-full bg-graduate-radial flex items-center justify-center text-white font-extrabold overflow-hidden flex-shrink-0">
                {profile?.avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-extrabold flex items-center gap-1 min-w-0">
                  <span className="truncate">{profile?.displayName || me?.email}</span>
                  {profile?.isVerified && <PremiumBadge size={13} />}
                </div>
                <div className="text-[11.5px] text-gray-400 truncate">@{profile?.handle ?? '—'}</div>
              </div>
              <button onClick={() => setShowDrawer(false)} aria-label="Close" className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {NAV.map(({ href, Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link key={href} href={href} onClick={() => setShowDrawer(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-bold transition
                      ${active ? 'text-accent bg-accent-lt' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Icon className="w-5 h-5" strokeWidth={2.25} />
                    {label}
                  </Link>
                )
              })}
              <div className="border-t border-gray-100 my-2" />
              <Link href="/profile" onClick={() => setShowDrawer(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-bold text-gray-700 hover:bg-gray-50 transition">
                <User className="w-5 h-5" strokeWidth={2.25} /> My Profile
              </Link>
              <Link href="/settings" onClick={() => setShowDrawer(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-bold text-gray-700 hover:bg-gray-50 transition">
                <Settings className="w-5 h-5" strokeWidth={2.25} /> Settings
              </Link>
              <button type="button" onClick={() => { setShowDrawer(false); setShowSupport(true) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-bold text-gray-700 hover:bg-gray-50 transition">
                <Headphones className="w-5 h-5" strokeWidth={2.25} /> Customer Support
              </button>
              {isAdmin && (
                <Link href="/admin" onClick={() => setShowDrawer(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-bold text-gray-700 hover:bg-gray-50 transition">
                  <ShieldCheck className="w-5 h-5" strokeWidth={2.25} /> Admin
                </Link>
              )}
            </div>
            <div className="border-t border-gray-100">
              <button onClick={() => { setShowDrawer(false); signOut() }}
                className="w-full flex items-center gap-3 px-4 py-3 text-[13.5px] font-bold text-red-600 hover:bg-red-50 transition">
                <LogOut className="w-5 h-5" strokeWidth={2.25} /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <main>{children}</main>
      <Toast />
      {showSupport && <SupportDialog onClose={closeSupport} />}
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
