'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.streamia.co'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error?.message || 'Login failed')
      router.push('/me')
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-sm p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-lt text-accent text-[11.5px] font-bold rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Next.js SSR — Faz 1
        </div>
        <h1 className="text-2xl font-extrabold mb-1">Sign in</h1>
        <p className="text-sm text-gray-400 mb-5">Cookie-based auth scaffold</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[12.5px] text-red-700 font-semibold">{error}</div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input required type="email" placeholder="Email" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent focus:bg-white transition" />
          <input required type="password" placeholder="Password" autoComplete="current-password" minLength={8}
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent focus:bg-white transition" />
          <button type="submit" disabled={loading}
            className="h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-sm transition mt-1 disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
