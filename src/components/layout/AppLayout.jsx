import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  BarChart3,
  Briefcase,
  Building2,
  Crown,
  Gem,
  Home,
  LogOut,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Trophy,
  User,
  Users,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/lib/store'
import NotificationBell from '@/components/layout/NotificationBell'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher'

const NAV_ITEMS = [
  { to: '/feed',        Icon: Home,          labelKey: 'nav.home' },
  { to: '/network',     Icon: Users,         labelKey: 'nav.network' },
  { to: '/jobs',        Icon: Briefcase,     labelKey: 'nav.jobs' },
  { to: '/messages',    Icon: MessageSquare, labelKey: 'nav.messages' },
  { to: '/leaderboard', Icon: Trophy,        labelKey: 'nav.leaderboard' },
  { to: '/reviews',     Icon: Star,          labelKey: 'nav.reviews' },
  { to: '/analytics',   Icon: BarChart3,     labelKey: 'nav.analytics' },
  { to: '/companies',   Icon: Building2,     labelKey: 'nav.brands' },
  { to: '/pricing',     Icon: Gem,           labelKey: 'nav.upgrade' },
]

const MOBILE_NAV = [
  { to: '/feed',        Icon: Home,          labelKey: 'nav.home' },
  { to: '/network',     Icon: Users,         labelKey: 'nav.network' },
  { to: '/leaderboard', Icon: Trophy,        labelKey: 'nav.leaderboard' },
  { to: '/messages',    Icon: MessageSquare, labelKey: 'nav.messages' },
  { to: '/companies',   Icon: Building2,     labelKey: 'nav.brands' },
]

export default function AppLayout() {
  const { t } = useTranslation()
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const displayName = profile?.displayName || 'User'
  const handle = profile?.handle || ''
  const initials = displayName.slice(0, 2).toUpperCase()
  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-bg">

      {/* ── DESKTOP NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 h-14 hidden md:flex items-center px-4 gap-2">
        <div className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight cursor-pointer flex-shrink-0"
          onClick={() => navigate('/feed')}>
          <span className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white">
            <Zap className="w-4 h-4" strokeWidth={2.5} />
          </span>
          Stream<span className="text-accent">Link</span>
        </div>

        <div className="relative flex-1 max-w-[240px] ml-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" strokeWidth={2.25} />
          <input type="text" placeholder={t('nav.search')}
            className="w-full h-[34px] bg-bg border border-transparent rounded-full pl-8 pr-3 text-[13px] outline-none focus:bg-white focus:border-accent transition" />
        </div>

        <div className="flex items-center gap-px ml-auto">
          {NAV_ITEMS.map(({ to, Icon, labelKey }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-[2px] px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition
                ${isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}>
              {({ isActive }) => (<>
                <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                <span>{t(labelKey)}</span>
                {isActive && <span className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-5 h-[2px] bg-gray-900 rounded" />}
              </>)}
            </NavLink>
          ))}
          <div className="ml-2"><NotificationBell /></div>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-400 text-white font-bold text-xs flex items-center justify-center cursor-pointer overflow-hidden ring-2 ring-accent/20 hover:ring-accent/40 transition">
              {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg w-52 py-1 z-50">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <div className="text-[13px] font-extrabold">{displayName}</div>
                  <div className="text-[11px] text-gray-400">@{handle}</div>
                </div>
                <MenuItem Icon={User} onClick={() => { navigate('/profile'); setShowMenu(false) }}>{t('nav.myProfile')}</MenuItem>
                <MenuItem Icon={BarChart3} onClick={() => { navigate('/analytics'); setShowMenu(false) }}>{t('nav.analytics')}</MenuItem>
                <MenuItem Icon={Building2} onClick={() => { navigate('/companies'); setShowMenu(false) }}>{t('nav.brands')}</MenuItem>
                <MenuItem Icon={Crown} onClick={() => { navigate('/pricing'); setShowMenu(false) }}>{t('nav.upgrade')}</MenuItem>
                <MenuItem Icon={Settings} onClick={() => { setShowMenu(false); navigate('/settings') }}>{t('nav.settings')}</MenuItem>
                {isAdmin && <MenuItem Icon={ShieldCheck} onClick={() => { setShowMenu(false); navigate('/admin') }}>{t('nav.admin')}</MenuItem>}
                <div className="px-3 py-2 border-t border-gray-100 mt-1"><LanguageSwitcher variant="select" /></div>
                <div className="border-t border-gray-100">
                  <MenuItem Icon={LogOut} danger onClick={signOut}>{t('nav.signOut')}</MenuItem>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── MOBILE TOP BAR ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 h-14 flex md:hidden items-center px-4 justify-between">
        <div className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight cursor-pointer"
          onClick={() => navigate('/feed')}>
          <span className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white">
            <Zap className="w-4 h-4" strokeWidth={2.5} />
          </span>
          Stream<span className="text-accent">Link</span>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />

          <div className="relative">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-400 text-white font-bold text-sm flex items-center justify-center overflow-hidden ring-2 ring-accent/20">
              {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
            </button>
            {showMobileMenu && (
              <div className="absolute right-0 top-11 bg-white border border-gray-200 rounded-xl shadow-xl w-52 py-1 z-50">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <div className="text-[13px] font-extrabold">{displayName}</div>
                  <div className="text-[11px] text-gray-400">@{handle}</div>
                </div>
                <MenuItem Icon={User} onClick={() => { navigate('/profile'); setShowMobileMenu(false) }}>{t('nav.myProfile')}</MenuItem>
                <MenuItem Icon={Trophy} onClick={() => { navigate('/leaderboard'); setShowMobileMenu(false) }}>{t('nav.leaderboard')}</MenuItem>
                <MenuItem Icon={Briefcase} onClick={() => { navigate('/jobs'); setShowMobileMenu(false) }}>{t('nav.jobs')}</MenuItem>
                <MenuItem Icon={BarChart3} onClick={() => { navigate('/analytics'); setShowMobileMenu(false) }}>{t('nav.analytics')}</MenuItem>
                <MenuItem Icon={Crown} onClick={() => { navigate('/pricing'); setShowMobileMenu(false) }}>{t('nav.upgrade')}</MenuItem>
                <MenuItem Icon={Settings} onClick={() => { setShowMobileMenu(false); navigate('/settings') }}>{t('nav.settings')}</MenuItem>
                {isAdmin && <MenuItem Icon={ShieldCheck} onClick={() => { setShowMobileMenu(false); navigate('/admin') }}>{t('nav.admin')}</MenuItem>}
                <div className="px-3 py-2 border-t border-gray-100 mt-1"><LanguageSwitcher variant="select" /></div>
                <div className="border-t border-gray-100">
                  <MenuItem Icon={LogOut} danger onClick={signOut}>{t('nav.signOut')}</MenuItem>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* ── MOBILE BOTTOM TAB BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex md:hidden safe-area-pb">
        {MOBILE_NAV.map(({ to, Icon, labelKey }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition
              ${isActive ? 'text-accent' : 'text-gray-400'}`}>
            <Icon className="w-5 h-5" strokeWidth={2.25} />
            <span className="text-[10px] font-bold">{t(labelKey)}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

function MenuItem({ Icon, children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 text-left px-4 py-2 text-[13px] transition
        ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}>
      <Icon className="w-4 h-4" strokeWidth={2} />
      {children}
    </button>
  )
}
