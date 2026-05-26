'use client'
import { useState } from 'react'
import { Link } from '@/lib/router-shim'
import { authApi } from '@/lib/api-client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await authApi.forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset link')
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

        {!sent ? (
          <>
            <h1 className="text-2xl font-extrabold mb-1">Forgot password?</h1>
            <p className="text-sm text-gray-400 mb-6">Enter your email and we'll send you a reset link</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[12.5px] text-red-700 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Email address</label>
                <input
                  type="email" required
                  className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending…
                  </>
                ) : 'Send Reset Link →'}
              </button>
            </form>
          </>
        ) : (
          /* Success state */
          <div className="text-center py-4">
            <div className="text-5xl mb-4">📧</div>
            <h2 className="text-[18px] font-extrabold mb-2">Check your inbox!</h2>
            <p className="text-[13.5px] text-gray-500 leading-relaxed mb-2">
              We sent a password reset link to
            </p>
            <p className="text-[13.5px] font-bold text-gray-800 mb-5">{email}</p>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[12px] text-blue-700 mb-5">
              💡 Check your spam/junk folder if you don't see it within a minute
            </div>
            <button onClick={() => { setSent(false); setEmail('') }}
              className="text-[13px] text-accent font-bold hover:underline">
              Try a different email
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
