'use client'
// Customer Support (QA #9.1, option A): opened from the side menu / avatar
// menu instead of a floating button that covered page content.
import { useEffect } from 'react'
import { Mail, MessageCircle, X } from 'lucide-react'

export default function SupportDialog({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const option = 'flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1'
  return (
    <div className="fixed inset-0 z-[70] bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Customer Support" onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[360px] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
          <div>
            <div className="text-[13.5px] font-extrabold text-gray-900">Customer Support</div>
            <div className="text-[11.5px] text-gray-500 mt-0.5">We usually reply within a few hours.</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 -m-1 text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" strokeWidth={2.25} />
          </button>
        </div>
        <div className="p-2">
          <a href="mailto:support@streamia.co" className={option}>
            <Mail className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" strokeWidth={2.25} aria-hidden />
            <div>
              <div className="text-[12.5px] font-bold text-gray-900">Email support</div>
              <div className="text-[11px] text-gray-500">support@streamia.co</div>
            </div>
          </a>
          <a href="/messages?to=support" className={option}>
            <MessageCircle className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" strokeWidth={2.25} aria-hidden />
            <div>
              <div className="text-[12.5px] font-bold text-gray-900">Message us in-app</div>
              <div className="text-[11px] text-gray-500">Open a support conversation</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
