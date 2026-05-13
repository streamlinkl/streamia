/**
 * Faz 0 placeholder — proves Next.js SSR is working alongside Vite.
 * Real LandingPage migrates here in Faz 2.
 */
export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-lt text-accent text-[11.5px] font-bold rounded-full mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Next.js SSR — Faz 0
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          Stream<span className="text-accent">Link</span> · Next.js scaffold is live
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          This page is rendered on the server. Vite app continues to run on
          <code className="px-1.5 py-0.5 bg-gray-100 rounded mx-1 text-[12px] text-gray-700">localhost:5173</code>
          — nothing in production changes yet.
        </p>
      </div>
    </main>
  )
}
