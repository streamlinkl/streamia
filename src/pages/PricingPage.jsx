import { useState } from 'react'
import { useAuthStore, useAppStore } from '@/lib/store'
import { stripeApi } from '@/lib/api'

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    icon: '🥈',
    price: 0,
    period: 'forever',
    description: 'Try Streamia for free',
    color: 'border-gray-200',
    btnClass: 'border border-gray-300 text-gray-700 hover:border-gray-500',
    features: [
      '1 active job listing',
      'Basic company profile',
      'Browse creator profiles',
      'Up to 10 applications/month',
    ],
    limits: ['No featured placement', 'No direct messaging', 'No analytics'],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: '🥇',
    price: 49,
    priceYear: 39,
    period: 'month',
    description: 'For growing brands',
    color: 'border-accent ring-2 ring-accent/20',
    btnClass: 'bg-accent hover:bg-accent-dk text-white',
    badge: '⭐ Most Popular',
    stripePriceMonthly: 'price_pro_monthly', // replace with real Stripe price ID
    stripePriceYearly: 'price_pro_yearly',
    features: [
      'See who viewed your profile',
      'Unlimited messaging (no daily limit)',
      'Unlimited job listings',
      'Featured placement in search',
      'Company analytics dashboard',
      'Verified badge',
    ],
    limits: [],
  },
  {
    id: 'business',
    name: 'Business',
    icon: '🏆',
    price: 149,
    priceYear: 119,
    period: 'month',
    description: 'For serious brand partners',
    color: 'border-purple-300',
    btnClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    stripePriceMonthly: 'price_business_monthly',
    stripePriceYearly: 'price_business_yearly',
    features: [
      'Everything in Pro',
      'Priority listing placement',
      'Dedicated account manager',
      'Creator match recommendations',
      'Contract & deal management',
      'White-label media kit requests',
      'API access',
    ],
    limits: [],
  },
]

export default function PricingPage() {
  const { profile } = useAuthStore()
  const { showToast } = useAppStore()
  const [billing, setBilling] = useState('monthly')
  const [loading, setLoading] = useState(null)

  const handleCheckout = async (plan) => {
    if (plan.id === 'basic') {
      showToast('✅ You\'re on the free plan!')
      return
    }
    if (!profile) {
      showToast('Please sign in first', 'error')
      return
    }

    setLoading(plan.id)
    try {
      const { url } = await stripeApi.checkout({ plan: plan.id, billing })
      if (url) {
        window.location.href = url
        return
      }
      showToast('Checkout URL was missing from response', 'error')
    } catch (err) {
      if (err.code === 'STRIPE_DISABLED' || err.code === 'PRICE_MISSING') {
        showToast('Payments are not set up yet. Check back soon!', 'error')
      } else {
        showToast(err.message || 'Could not start checkout', 'error')
      }
    }
    setLoading(null)
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-lt text-accent rounded-full text-[11.5px] font-bold uppercase tracking-wider mb-4">
          💰 Simple Pricing
        </div>
        <h1 className="text-[32px] font-extrabold tracking-tight mb-3">
          Streamers are free.<br />
          <span className="text-accent">Brands pay to find them.</span>
        </h1>
        <p className="text-gray-500 text-[15px] max-w-md mx-auto">
          Post jobs, find the perfect creators for your brand, and manage all your campaigns in one place.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className={`text-[13px] font-bold ${billing === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
            className={`w-12 h-6 rounded-full relative transition ${billing === 'yearly' ? 'bg-accent' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${billing === 'yearly' ? 'left-7' : 'left-1'}`} />
          </button>
          <span className={`text-[13px] font-bold ${billing === 'yearly' ? 'text-gray-900' : 'text-gray-400'}`}>
            Yearly <span className="text-green-600 font-extrabold">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {PLANS.map(plan => (
          <div key={plan.id} className={`bg-white border-2 rounded-2xl p-6 relative shadow-sm ${plan.color}`}>
            {plan.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent text-white text-[11px] font-extrabold px-4 py-1 rounded-full whitespace-nowrap">
                {plan.badge}
              </div>
            )}

            <div className="text-3xl mb-3">{plan.icon}</div>
            <div className="text-[17px] font-extrabold mb-1">{plan.name}</div>
            <div className="text-[12.5px] text-gray-400 mb-4">{plan.description}</div>

            <div className="mb-5">
              {plan.price === 0 ? (
                <div className="text-[32px] font-extrabold">Free</div>
              ) : (
                <div className="flex items-end gap-1">
                  <div className="text-[32px] font-extrabold">
                    ${billing === 'yearly' ? plan.priceYear : plan.price}
                  </div>
                  <div className="text-[13px] text-gray-400 mb-1.5">/month</div>
                </div>
              )}
              {billing === 'yearly' && plan.price > 0 && (
                <div className="text-[11.5px] text-green-600 font-bold mt-0.5">
                  Billed ${(plan.priceYear * 12)} yearly — save ${(plan.price - plan.priceYear) * 12}/yr
                </div>
              )}
            </div>

            <button
              onClick={() => handleCheckout(plan)}
              disabled={loading === plan.id}
              className={`w-full h-11 rounded-full font-bold text-[14px] transition mb-5 disabled:opacity-60 ${plan.btnClass}`}
            >
              {loading === plan.id ? 'Redirecting…' : plan.price === 0 ? 'Get Started Free' : `Start ${plan.name} →`}
            </button>

            <div className="space-y-2.5">
              {plan.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-[12.5px] text-gray-700">
                  <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span> {f}
                </div>
              ))}
              {plan.limits.map((l, i) => (
                <div key={i} className="flex items-start gap-2 text-[12.5px] text-gray-400">
                  <span className="mt-0.5 flex-shrink-0">✕</span> {l}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Commission info */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💰</div>
          <div>
            <div className="font-extrabold text-[15px] mb-1">Brand Deal Commission</div>
            <p className="text-[13.5px] text-gray-600 leading-relaxed">
              When a deal closes through Streamia, we take a <strong>8% platform fee</strong> from the brand side only —
              streamers keep 100% of their earnings. This covers payment processing, contract management, and dispute resolution.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-[16px] font-extrabold mb-4">Common questions</h2>
        <div className="space-y-4">
          {[
            ['Can I cancel anytime?', 'Yes — cancel anytime from your account settings. No contracts, no cancellation fees.'],
            ['Do streamers ever pay?', 'Never. Streamia is completely free for streamers, always.'],
            ['What payment methods do you accept?', 'All major credit/debit cards, Apple Pay, and Google Pay via Stripe.'],
            ['Is there a free trial?', 'The Basic plan is free forever. Pro and Business plans come with a 7-day free trial.'],
            ['How does the 8% commission work?', 'Only applies to deals closed through our platform. If you find a creator through Streamia but handle payment outside, no fee applies.'],
          ].map(([q, a]) => (
            <div key={q} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="font-bold text-[13.5px] mb-1">{q}</div>
              <div className="text-[13px] text-gray-500">{a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex justify-center gap-6 mt-8 flex-wrap">
        {['🔒 Secured by Stripe', '🚫 No hidden fees', '✅ Cancel anytime', '🌍 Global payments'].map(t => (
          <div key={t} className="text-[12.5px] text-gray-400 font-semibold">{t}</div>
        ))}
      </div>
    </div>
  )
}
