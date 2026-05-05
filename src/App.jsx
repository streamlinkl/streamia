import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/lib/store'
import AppLayout from '@/components/layout/AppLayout'
import Toast     from '@/components/layout/Toast'

// Critical pages — load immediately (users land here first)
import LandingPage        from '@/pages/LandingPage'
import LoginPage          from '@/pages/LoginPage'
import RegisterPage       from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage      from '@/pages/ResetPasswordPage'
import RegisterCompanyPage from '@/pages/RegisterCompanyPage'

// App pages — lazy load after login (saves ~300KB on first visit)
const FeedPage      = lazy(() => import('@/pages/FeedPage'))
const ProfilePage   = lazy(() => import('@/pages/ProfilePage'))
const MessagesPage  = lazy(() => import('@/pages/MessagesPage'))
const NetworkPage   = lazy(() => import('@/pages/NetworkPage'))
const JobsPage      = lazy(() => import('@/pages/JobsPage'))
const OffersPage    = lazy(() => import('@/pages/OffersPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const CompaniesPage = lazy(() => import('@/pages/CompaniesPage'))
const PricingPage   = lazy(() => import('@/pages/PricingPage'))
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'))
const ReviewsPage = lazy(() => import('@/pages/ReviewsPage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const ManageJobsPage = lazy(() => import('@/pages/ManageJobsPage'))
const ProfileViewsPage = lazy(() => import('@/pages/ProfileViewsPage'))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      <div className="text-xs text-gray-400 font-medium">Loading…</div>
    </div>
  </div>
)

function Protected({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function PublicOnly({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <PageLoader />
  if (user) return <Navigate to="/feed" replace />
  return children
}

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  return (
    <BrowserRouter>
      <Toast />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/"                element={<LandingPage />} />
          <Route path="/login"           element={<PublicOnly><LoginPage /></PublicOnly>} />
          <Route path="/register"        element={<PublicOnly><RegisterPage /></PublicOnly>} />
          <Route path="/forgot-password" element={<PublicOnly><ForgotPasswordPage /></PublicOnly>} />
          <Route path="/reset-password"      element={<ResetPasswordPage />} />
          <Route path="/register/company" element={<PublicOnly><RegisterCompanyPage /></PublicOnly>} />

          <Route element={<Protected><AppLayout /></Protected>}>
            <Route path="/feed"         element={<FeedPage />} />
            <Route path="/profile/:id?" element={<ProfilePage />} />
            <Route path="/messages"     element={<MessagesPage />} />
            <Route path="/network"      element={<NetworkPage />} />
            <Route path="/jobs"         element={<JobsPage />} />
            <Route path="/offers"       element={<OffersPage />} />
            <Route path="/analytics"    element={<AnalyticsPage />} />
            <Route path="/companies"    element={<CompaniesPage />} />
            <Route path="/leaderboard"  element={<LeaderboardPage />} />
            <Route path="/reviews"      element={<ReviewsPage />} />
            <Route path="/admin"        element={<AdminPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings"      element={<SettingsPage />} />
            <Route path="/jobs/manage"   element={<ManageJobsPage />} />
            <Route path="/profile-views" element={<ProfileViewsPage />} />
            <Route path="/pricing"      element={<PricingPage />} />
            <Route path="/app"          element={<Navigate to="/feed" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
