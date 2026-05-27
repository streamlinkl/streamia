'use client'
import { useEffect, useState } from 'react'
import { Headphones, Mail, MessageCircle, X } from 'lucide-react'

/**
 * Global support FAB — pinned to bottom-right on every route (mounted from
 * app/layout.jsx). Tapping toggles a small popover with two contact options:
 *  - Email support (mailto:support@streamia.co)
 *  - In-app message (deep-links into /messages once Option B / support
 *    conversation lands; for now it lands the user in the inbox).
 */
export default function SupportFab() {
  const [open, setOpen] = useState(false)

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close support menu' : 'Open support menu'}
        aria-expanded={open}
        aria-controls="support-popover"
        className="fixed bottom-5 right-5 z-[60] w-12 h-12 rounded-full bg-accent text-white shadow-[0_8px_24px_-6px_rgba(108,99,255,0.5)] hover:bg-accent-dk transition flex items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40"
      >
        {open
          ? <X className="w-5 h-5" strokeWidth={2.25} aria-hidden />
          : <Headphones className="w-5 h-5" strokeWidth={2.25} aria-hidden />}
      </button>

      {open && (
        <div
          id="support-popover"
          role="dialog"
          aria-label="Support"
          className="fixed bottom-20 right-5 z-[60] w-[320px] max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/60">
            <div className="text-[13px] font-extrabold text-gray-900">Need help?</div>
            <div className="text-[11.5px] text-gray-500 mt-0.5">We usually reply within a few hours.</div>
          </div>
          <div className="p-2">
            <a
              href="mailto:support@streamia.co"
              className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
            >
              <Mail className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" strokeWidth={2.25} aria-hidden />
              <div>
                <div className="text-[12.5px] font-bold text-gray-900">Email support</div>
                <div className="text-[11px] text-gray-500">support@streamia.co</div>
              </div>
            </a>
            <a
              href="/messages?to=support"
              className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1"
            >
              <MessageCircle className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" strokeWidth={2.25} aria-hidden />
              <div>
                <div className="text-[12.5px] font-bold text-gray-900">Message us in-app</div>
                <div className="text-[11px] text-gray-500">Open a support conversation</div>
              </div>
            </a>
          </div>
        </div>
      )}
    </>
  )
}
