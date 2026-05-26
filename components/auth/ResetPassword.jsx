'use client'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from '@/lib/router-shim'
import { authApi } from '@/lib/api-client'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const ready = Boolean(token)

  useEffect(() => {
    if (!token) setError('Missing reset token. Use the link from your email.')
  }, [token])

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      navigate('/login', { replace: true })
    } catch (err) {
      if (err.code === 'RESET_INVALID') setError('Reset link is invalid or has expired.')
      else setError(err.message || 'Could not reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full max-w-sm p-8">

        {/* Logo */}
        <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight mb-6">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-white">⚡</div>
          Stream <span className="text-accent">Link</span>
        </div>

        {!ready ? (
          <div className="text-center py-6">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-400">Verifying your reset link…</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold mb-1">Set new password</h1>
            <p className="text-sm text-gray-400 mb-6">Choose a strong password for your account</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[12.5px] text-red-700 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">New Password</label>
                <input
                  type="password" required
                  className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Confirm Password</label>
                <input
                  type="password" required
                  className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Same password again"
                  autoComplete="new-password"
                />
                {confirm && password !== confirm && (
                  <p className="text-[11px] text-red-500 mt-1 font-semibold">Passwords don't match</p>
                )}
                {confirm && password === confirm && confirm.length >= 8 && (
                  <p className="text-[11px] text-green-600 mt-1 font-semibold">✓ Passwords match</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !password || !confirm || password !== confirm}
                className="w-full h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating…
                  </>
                ) : 'Set New Password →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
