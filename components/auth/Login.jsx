'use client'
import { useState } from 'react'
import { Link, useNavigate } from '@/lib/router-shim'
import { authApi } from '@/lib/api-client'
import { useAuthStore } from '@/lib/store'

export default function LoginPage() {
  const navigate = useNavigate()
  const acceptSession = useAuthStore((s) => s.acceptSession)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const result = await authApi.login({ email: form.email.trim(), password: form.password })
      await acceptSession(result)
      navigate('/feed', { replace: true })
    } catch (err) {
      if (err.code === 'INVALID_CREDENTIALS') setErrorMsg('❌ Wrong email or password. Please try again.')
      else if (err.code === 'VALIDATION_ERROR') setErrorMsg('Please fill in email and password correctly.')
      else setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full max-w-sm p-8">

        <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight mb-6">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-white">⚡</div>
          Stream <span className="text-accent">Link</span>
        </div>

        <h1 className="text-2xl font-extrabold mb-1">Welcome back</h1>
        <p className="text-sm text-gray-400 mb-6">Sign in to your account</p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[12.5px] text-red-700 font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
            <input type="email" required
              className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
              value={form.email}
              onChange={e => { setForm({ ...form, email: e.target.value }); setErrorMsg('') }}
              placeholder="you@example.com"
              autoComplete="email" autoCapitalize="none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
            <input type="password" required
              className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
              value={form.password}
              onChange={e => { setForm({ ...form, password: e.target.value }); setErrorMsg('') }}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {/* Forgot password link */}
          <div className="flex justify-end -mt-1">
            <Link to="/forgot-password" className="text-[12.5px] text-accent font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading || !form.email || !form.password}
            className="w-full h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in…
              </>
            ) : 'Sign In →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-semibold hover:underline">Join free</Link>
        </p>
      </div>
    </div>
  )
}
