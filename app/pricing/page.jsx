import Link from 'next/link'
import { ArrowRight, Award, Check, Crown, Zap } from 'lucide-react'

export const metadata = {
  title: 'Pricing',
  description:
    'Simple plans for streamers, influencers, brands and agencies. Free forever for creators; Pro from $39/mo.',
  openGraph: {
    title: 'StreamLink pricing',
    description: 'Free forever for streamers. Pro plans for brands and agencies.',
    url: 'https://streamia.co/pricing',
    siteName: 'StreamLink',
  },
}

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    Icon: Award,
    iconBg: 'bg-gray-100 text-gray-700',
    price: 0,
    period: 'forever',
    description: 'Get started for free',
    cardClass: 'border-gray-200',
    cta: 'Create free account',
    ctaHref: '/register',
    ctaClass: 'border border-gray-300 text-gray-700 hover:border-gray-500',
    features: [
      'Full streamer profile',
      'Browse creator network',
      'Up to 10 job applications / month',
      'Direct DM with creators (2 new / day)',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    Icon: Crown,
    iconBg: 'bg-accent-lt text-accent',
    price: 15,
    period: 'month',
    description: 'For serious creators',
    cardClass: 'border-accent ring-2 ring-accent/20',
    badge: 'Most popular',
    cta: 'Upgrade',
    ctaHref: '/login?next=/pricing',
    ctaClass: 'bg-accent hover:bg-accent-dk text-white',
    features: [
      'See who viewed your profile',
      'Unlimited messaging (no daily cap)',
      'Featured placement in search',
      'Channel analytics dashboard',
      'Verified badge',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    Icon: Zap,
    iconBg: 'bg-purple-100 text-purple-700',
    price: 149,
    period: 'month',
    description: 'For brands & agencies',
    cardClass: 'border-purple-200',
    cta: 'Talk to sales',
    ctaHref: '/register/company',
    ctaClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    features: [
      'Everything in Pro',
      'Priority listing placement',
      'Dedicated account manager',
      'Creator match recommendations',
      'Contract & deal management',
      'API access',
    ],
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto h-16 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight">
            <span className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center text-white">
              <Zap className="w-4 h-4" strokeWidth={2.5} />
            </span>
            Stream<span className="text-accent">Link</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/login" className="px-3 py-1.5 text-[13.5px] font-semibold text-gray-600 hover:text-gray-900 transition">Sign in</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white text-[13px] font-bold rounded-full transition">
              Get started <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-lt text-accent rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-4">
            Pricing
          </div>
          <h1 className="text-[40px] md:text-5xl font-extrabold tracking-tight">Simple plans, no surprises</h1>
          <p className="text-gray-500 mt-4 text-[15px]">
            Free forever for streamers. Pro plans for brands and agencies that need to scale.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-4">
        {PLANS.map(({ id, name, Icon, iconBg, price, period, description, cardClass, badge, cta, ctaHref, ctaClass, features }) => (
          <div key={id} className={`relative bg-white border rounded-2xl p-7 ${cardClass}`}>
            {badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-accent text-white text-[10.5px] font-extrabold uppercase tracking-wider rounded-full shadow-sm">
                {badge}
              </div>
            )}
            <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${iconBg}`}>
              <Icon className="w-5 h-5" strokeWidth={2.25} />
            </div>
            <div className="mt-5">
              <div className="text-[14px] font-extrabold uppercase tracking-wider text-gray-500">{name}</div>
              <div className="text-[12px] text-gray-400 mt-0.5">{description}</div>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-[40px] font-extrabold tracking-tight">${price}</span>
              <span className="text-[13px] text-gray-400 font-semibold">/ {period}</span>
            </div>
            <Link href={ctaHref} className={`mt-5 inline-flex items-center justify-center w-full h-11 rounded-full text-[13.5px] font-bold transition ${ctaClass}`}>
              {cta}
            </Link>
            <ul className="mt-6 space-y-2.5">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px] text-gray-600">
                  <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" strokeWidth={3} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-extrabold tracking-tight">
            <span className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white">
              <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
            </span>
            Stream<span className="text-accent">Link</span>
          </Link>
          <div className="md:ml-auto text-[11.5px] text-gray-400">
            © {new Date().getFullYear()} StreamLink · Built for streamers, by streamers.
          </div>
        </div>
      </footer>
    </main>
  )
}
