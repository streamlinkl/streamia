'use client'
import { useState } from 'react'
import { useAuthStore, useAppStore } from '@/lib/store'

const OFFERS = [
  { id: 1, brand: 'RedBull Gaming', logo: '🐂', type: 'Sponsored Stream', title: 'RedBull Creator Series', value: '$2,500', period: 'per stream', match: 96, urgent: true, deadline: '3 days left', description: 'We loved your content style and think you\'d be a perfect fit for our Creator Series. 4 sponsored streams over 2 months. Full creative freedom — just naturally integrate RedBull into your session.', perks: ['$2,500 per stream', 'Free product shipment', '3-month exclusivity bonus', 'Social media boost'], bg: 'from-red-500 to-red-700' },
  { id: 2, brand: 'SteelSeries', logo: '🎧', type: 'Ambassador', title: 'SteelSeries Pro Ambassador', value: '$1,800', period: 'per month', match: 89, urgent: false, deadline: '12 days left', description: 'SteelSeries is building its ambassador roster for 2025. As an ambassador you\'ll represent our brand, receive all new products, and earn a monthly retainer plus affiliate commission.', perks: ['$1,800 monthly retainer', 'All products free', '15% affiliate commission', 'Event invitations'], bg: 'from-orange-400 to-orange-600' },
  { id: 3, brand: 'ASUS ROG', logo: '🖥️', type: 'Product Review', title: 'ROG GPU Review Series', value: '$900', period: 'per video', match: 82, urgent: false, deadline: '7 days left', description: 'ASUS ROG wants authentic tech reviews from gaming creators. You\'ll receive the latest GPU, create an honest review video, and keep the hardware. No script — just your real opinion.', perks: ['$900 per video', 'Keep all hardware', 'First access to new releases', 'Feature on ROG socials'], bg: 'from-blue-500 to-blue-700' },
  { id: 4, brand: 'G2 Esports', logo: '🏆', type: 'Event Coverage', title: 'G2 Tournament Coverage', value: '$3,200', period: 'per event', match: 78, urgent: false, deadline: '18 days left', description: 'G2 is looking for creators to cover our upcoming tournament series from inside the arena. Flights, hotels, meals, and media pass included. Full creative freedom on content.', perks: ['$3,200 per event', 'Travel & accommodation', 'Media access', 'Networking with pros'], bg: 'from-purple-500 to-purple-700' },
]

export default function OffersPage() {
  const { profile } = useAuthStore()
  const { showToast } = useAppStore()
  const [selected, setSelected] = useState(OFFERS[0])
  const [applied, setApplied] = useState(new Set())
  const [showApply, setShowApply] = useState(false)
  const [message, setMessage] = useState('')
  const [applying, setApplying] = useState(false)
  const [tab, setTab] = useState('New')

  const handleApply = () => {
    if (!message.trim()) return
    setApplying(true)
    setTimeout(() => {
      setApplied(s => new Set([...s, selected.id]))
      showToast('🎉 Application sent to ' + selected.brand + '!')
      setShowApply(false)
      setMessage('')
      setApplying(false)
    }, 900)
  }

  const stats = [{ label: 'New Offers', value: OFFERS.length, icon: '⭐', color: 'text-accent' }, { label: 'Applied', value: applied.size, icon: '📤', color: 'text-blue-500' }, { label: 'Active Deals', value: 1, icon: '✅', color: 'text-green-500' }, { label: 'Total Earned', value: '$4.2K', icon: '💰', color: 'text-amber-500' }]

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-[22px] font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-[11px] text-gray-400 font-semibold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 px-5">
          {['New', 'Applied', 'Active', 'Declined'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`relative px-5 py-3.5 text-[13px] font-bold transition ${tab === t ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
              {t}
              {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded" />}
            </button>
          ))}
        </div>

        {tab === 'New' && (
          <div className="grid grid-cols-1 md:grid-cols-[340px_1fr]">
            {/* Offer list */}
            <div className="border-r border-gray-100 divide-y divide-gray-50">
              {OFFERS.map(offer => (
                <div key={offer.id} onClick={() => setSelected(offer)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${selected?.id === offer.id ? 'bg-accent-lt border-l-[3px] border-l-accent' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">{offer.logo}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-extrabold">{offer.brand}</span>
                        {offer.urgent && <span className="text-[9.5px] bg-live text-white font-black px-1.5 py-0.5 rounded-full">URGENT</span>}
                      </div>
                      <div className="text-[12px] text-gray-500 truncate mb-1">{offer.title}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-accent">{offer.value} <span className="text-gray-400 font-normal">{offer.period}</span></span>
                        <span className="text-[11px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full">{offer.match}% match</span>
                      </div>
                    </div>
                  </div>
                  {applied.has(offer.id) && <div className="mt-2 text-[11px] text-blue-600 font-bold">✓ Applied</div>}
                </div>
              ))}
            </div>

            {/* Offer detail */}
            {selected && (
              <div className="p-6">
                <div className={`h-20 rounded-xl bg-gradient-to-r ${selected.bg} mb-5 flex items-center px-5 gap-4`}>
                  <div className="text-4xl">{selected.logo}</div>
                  <div>
                    <div className="text-white font-extrabold text-[17px]">{selected.brand}</div>
                    <div className="text-white/70 text-[12px]">{selected.type}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-white font-extrabold text-[20px]">{selected.value}</div>
                    <div className="text-white/70 text-[12px]">{selected.period}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[12px] bg-green-50 text-green-700 font-extrabold px-3 py-1 rounded-full">⭐ {selected.match}% match for you</span>
                  <span className="text-[12px] bg-orange-50 text-orange-600 font-bold px-3 py-1 rounded-full">⏰ {selected.deadline}</span>
                </div>

                <h2 className="text-[17px] font-extrabold mb-2">{selected.title}</h2>
                <p className="text-[13.5px] text-gray-600 leading-relaxed mb-5">{selected.description}</p>

                <div className="mb-5">
                  <div className="text-[12px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">What's included</div>
                  <div className="grid grid-cols-2 gap-2">
                    {selected.perks.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-[13px] text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-accent font-bold">✓</span> {p}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  {applied.has(selected.id) ? (
                    <div className="px-6 py-2.5 bg-green-50 text-green-700 font-bold rounded-full text-[14px]">✓ Application Sent</div>
                  ) : (
                    <button onClick={() => setShowApply(true)} className="px-6 py-2.5 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-[14px] transition">Accept & Apply →</button>
                  )}
                  <button onClick={() => showToast('Offer dismissed')} className="px-5 py-2.5 border border-gray-200 text-gray-500 font-bold rounded-full text-[13px] hover:border-gray-400 transition">Not interested</button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab !== 'New' && (
          <div className="p-16 text-center">
            <div className="text-4xl mb-3">{tab === 'Applied' ? '📤' : tab === 'Active' ? '✅' : '❌'}</div>
            <div className="font-bold text-gray-600 mb-1">{tab === 'Applied' ? `${applied.size} applications sent` : tab === 'Active' ? '1 active deal' : 'No declined offers'}</div>
            <div className="text-sm text-gray-400">Brands will reply within 3–5 business days</div>
          </div>
        )}
      </div>

      {/* Apply modal */}
      {showApply && selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowApply(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-[17px] font-extrabold">Apply to {selected.brand}</h3>
              <button onClick={() => setShowApply(false)} className="text-gray-400 text-xl hover:text-gray-700">✕</button>
            </div>
            <div className="text-[12.5px] text-gray-400 mb-5">{selected.title}</div>
            <div>
              <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Your pitch *</label>
              <textarea rows={5} placeholder={`Tell ${selected.brand} why you'd be perfect. Mention your audience size, niche, engagement, and why you genuinely like their brand…`}
                className="w-full bg-bg border border-gray-200 rounded-xl p-3 text-[13px] outline-none focus:border-accent resize-none"
                value={message} onChange={e => setMessage(e.target.value)} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleApply} disabled={!message.trim() || applying}
                className="flex-1 h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full disabled:opacity-50 transition">
                {applying ? 'Sending…' : 'Send Application →'}
              </button>
              <button onClick={() => setShowApply(false)} className="px-5 border border-gray-200 rounded-full text-[13px] font-semibold text-gray-500 hover:border-gray-400 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
