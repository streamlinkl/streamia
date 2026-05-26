'use client'
import { useAppStore } from '@/lib/store'
import { CheckCircle, X, XCircle } from 'lucide-react'

export default function Toast() {
  const toasts = useAppStore((s) => s.toasts)
  const dismiss = useAppStore((s) => s.dismissToast)
  if (!toasts?.length) return null
  return (
    <div className="fixed bottom-5 right-5 z-[100] space-y-2 pointer-events-none">
      {toasts.map((t) => {
        const isErr = t.kind === 'error'
        return (
          <div key={t.id}
            className={`pointer-events-auto flex items-start gap-2 max-w-sm px-4 py-3 rounded-xl shadow-lg border text-[13px] font-semibold
              ${isErr ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-gray-200 text-gray-800'}`}>
            {isErr ? <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                   : <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />}
            <div className="flex-1 min-w-0">{t.message}</div>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss"
              className="text-gray-400 hover:text-gray-700 transition flex-shrink-0">
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
