import Link from 'next/link'
import {
  ArrowRight, BadgeCheck, BarChart3, Building2, Calendar, Check, DollarSign, Handshake,
  Heart, MessageCircle, MessageSquare, Radio, Share2, Sparkles, Users, Zap,
} from 'lucide-react'

// Brand marks — lucide doesn't ship Twitch/Kick/YouTube.
function TwitchMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M2.149 0L.537 4.119v16.836h5.731V24h3.224l3.045-3.045h4.657L23.462 14.836V0zm19.164 13.761l-3.582 3.582h-5.731l-3.045 3.045v-3.045H4.134V2.149h17.179zm-3.582-7.164v6.567h-2.149V6.597zm-5.731 0v6.567H9.851V6.597z" />
    </svg>
  )
}
function YouTubeMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}
function KickMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M1.714 0h5.143v6.857h1.714v-3.43h1.715V1.714h1.714V0h6.857v5.143H17.14v1.714h-1.715v3.429h-1.714v3.428h1.714v3.429h1.715v1.714h1.714V24h-6.857v-1.714h-1.714v-1.715H8.571V17.14H6.857V24H1.714Z" />
    </svg>
  )
}

const FEATURES = [
  { key: 'network',   Icon: Handshake,     accent: 'bg-violet-50 text-violet-600 ring-violet-100',
    title: 'Professional Network',
    desc: 'Connect with 42K+ streamers, find collab partners and build a real creator community.' },
  { key: 'deals',     Icon: DollarSign,    accent: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    title: 'Brand Partnerships',
    desc: 'Get matched with brands actively hiring creators. Apply, negotiate and close deals in one place.' },
  { key: 'analytics', Icon: BarChart3,     accent: 'bg-sky-50 text-sky-600 ring-sky-100',
    title: 'Channel Analytics',
    desc: 'Track your growth, viewer stats and revenue trends in a dashboard built for creators.' },
  { key: 'messaging', Icon: MessageSquare, accent: 'bg-amber-50 text-amber-600 ring-amber-100',
    title: 'Direct Messaging',
    desc: 'DM any streamer, brand or agency. No middleman, no cold emails — just conversations.' },
  { key: 'companies', Icon: Building2,     accent: 'bg-rose-50 text-rose-600 ring-rose-100',
    title: 'Company Pages',
    desc: 'Discover agencies and brands looking for creators in your niche with verified company profiles.' },
  { key: 'schedule',  Icon: Calendar,      accent: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    title: 'Stream Schedule',
    desc: 'Share your go-live calendar, let fans subscribe to reminders and plan collabs with ease.' },
]

const BRAND_BULLETS = [
  { Icon: Users, text: '42,000+ verified streamers to discover' },
  { Icon: BadgeCheck, text: 'Authenticated Twitch, Kick and YouTube profiles' },
  { Icon: BarChart3, text: 'Real-time campaign analytics' },
  { Icon: MessageSquare, text: 'Direct messaging with creators, zero commissions' },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto h-16 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight">
            <span className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center text-white">
              <Zap className="w-4 h-4" strokeWidth={2.5} />
            </span>
            Stream<span className="text-accent">Link</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 ml-10 text-[13.5px] text-gray-500 font-semibold">
            <a href="#features" className="hover:text-gray-900 transition">Platform</a>
            <a href="#brands" className="hover:text-gray-900 transition">For brands &amp; agencies</a>
            <Link href="/pricing" className="hover:text-gray-900 transition">Upgrade</Link>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/login" className="px-3 py-1.5 text-[13.5px] font-semibold text-gray-600 hover:text-gray-900 transition">Sign in</Link>
            <Link href="/register" className="group inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white text-[13px] font-bold rounded-full transition">
              Get started
              <ArrowRight className="w-3.5 h-3.5 -mr-0.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-6 pt-16 sm:pt-20 pb-20 sm:pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 border border-rule rounded-full text-micro font-mono font-semibold uppercase text-muted bg-paper">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-accent text-white rounded-full" aria-hidden>
                <Radio className="w-3 h-3" strokeWidth={2.5} />
              </span>
              Built for livestreamers
            </div>

            <h1 className="font-display text-h2-lg sm:text-display md:text-display-lg text-ink mt-6 font-medium">
              The professional{' '}
              <em className="not-italic md:italic text-accent-dk font-medium">home</em>{' '}
              for streamers.
            </h1>
            <p className="text-lede text-muted mt-5 max-w-lg">
              Connect with top streamers, land brand deals, find collaborators and track your growth — all in one professional network built for creators.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link href="/register" className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink hover:bg-black text-white font-semibold rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                Create your free profile
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} aria-hidden />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-rule hover:border-ink text-ink font-semibold rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                Explore the feed
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-caption text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} aria-hidden />
                Free forever for streamers
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} aria-hidden />
                No credit card required
              </span>
            </div>

            <div className="mt-10 pt-8 border-t border-rule">
              <div className="text-micro font-mono font-semibold uppercase text-muted mb-3">Works with your platforms</div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { Mark: TwitchMark, name: 'Twitch', cls: 'text-[#9146FF]' },
                  { Mark: KickMark, name: 'Kick', cls: 'text-[#53FC18]' },
                  { Mark: YouTubeMark, name: 'YouTube', cls: 'text-[#FF0033]' },
                ].map(({ Mark, name, cls }) => (
                  <div key={name} className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 border border-rule rounded-full text-caption font-semibold text-ink bg-paper">
                    <Mark className={`w-3.5 h-3.5 ${cls}`} />
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview cards — editorial flat with hairline borders */}
          <div className="relative">
            <div className="grid grid-cols-6 gap-3">
              <div className="col-span-6 bg-paper border border-rule rounded-2xl p-5 shadow-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center text-white font-mono font-semibold text-[11px]">SV</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-caption font-bold text-ink truncate">ShadowViper</span>
                      <BadgeCheck className="w-4 h-4 text-sky-500" fill="currentColor" strokeWidth={0} aria-hidden />
                    </div>
                    <div className="text-micro font-mono text-muted">Twitch Partner · Horror games</div>
                  </div>
                  <div className="inline-flex items-center gap-1 text-micro font-mono font-bold text-live uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse" aria-hidden />
                    Live
                  </div>
                </div>
                <p className="text-caption text-ink/80 leading-relaxed">
                  Just hit <strong className="text-ink">100,000 followers</strong> on Twitch! 3 years of late nights and horror games finally paid off.
                </p>
                <div className="flex items-center gap-5 mt-4 pt-3 border-t border-rule text-muted">
                  <div className="inline-flex items-center gap-1.5 text-caption font-medium"><Heart className="w-3.5 h-3.5" strokeWidth={2} aria-hidden /> 3.2K</div>
                  <div className="inline-flex items-center gap-1.5 text-caption font-medium"><MessageCircle className="w-3.5 h-3.5" strokeWidth={2} aria-hidden /> 847</div>
                  <div className="inline-flex items-center gap-1.5 text-caption font-medium ml-auto"><Share2 className="w-3.5 h-3.5" strokeWidth={2} aria-hidden /> Share</div>
                </div>
              </div>

              <div className="col-span-3 bg-paper border border-rule rounded-2xl p-4 shadow-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-white font-mono font-semibold text-[10px]">NX</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-caption font-bold text-ink truncate">NeonXtra</div>
                    <div className="flex items-center gap-1 text-micro font-mono text-muted">
                      <KickMark className="w-3 h-3 text-[#53FC18]" />
                      Kick · FPS
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-accent-lt rounded-lg">
                  <Handshake className="w-3.5 h-3.5 text-accent-dk" strokeWidth={2} aria-hidden />
                  <span className="text-caption font-semibold text-accent-dk">Looking for duo collab</span>
                </div>
              </div>

              <div className="col-span-3 bg-ink text-white border border-ink rounded-2xl p-4 shadow-card relative overflow-hidden">
                <div className="inline-flex items-center gap-1 text-micro font-mono font-bold uppercase text-amber-300 mb-3">
                  <DollarSign className="w-3 h-3" strokeWidth={2.5} aria-hidden />
                  Brand deal
                </div>
                <div className="text-caption font-bold">RedBull Gaming</div>
                <div className="text-micro font-mono text-white/60 mt-0.5">FPS · 50K+ followers</div>
                <div className="font-display text-[28px] leading-none tracking-tight mt-3">$2,500<span className="text-micro font-mono text-white/60 ml-1.5">/stream</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo bar */}
      <section className="border-y border-gray-100 bg-gray-50/80">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center gap-4 flex-wrap">
          <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">Trusted by creators partnered with</span>
          <div className="flex-1 flex items-center justify-end gap-7 flex-wrap opacity-70">
            {['RedBull', 'Logitech', 'NVIDIA', 'SteelSeries', 'Razer', 'ASUS ROG'].map((b) => (
              <span key={b} className="text-[13px] font-extrabold tracking-tight text-gray-500">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-lt text-accent rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2.5} />
            Platform
          </div>
          <h2 className="text-[34px] md:text-4xl font-extrabold tracking-tight">Everything a streamer needs</h2>
          <p className="text-gray-500 mt-3 text-[15px]">One platform, your entire streaming career.</p>
        </div>
        <div className="max-w-5xl mx-auto px-6 mt-12 grid md:grid-cols-3 gap-4">
          {FEATURES.map(({ key, Icon, accent, title, desc }) => (
            <div key={key} className="group relative bg-white border border-gray-200 rounded-2xl p-6 transition hover:border-gray-300 hover:shadow-[0_8px_32px_-12px_rgba(15,23,42,0.12)]">
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ring-8 ${accent}`}>
                <Icon className="w-5 h-5" strokeWidth={2.25} />
              </div>
              <div className="font-extrabold mt-5 text-[15px]">{title}</div>
              <div className="text-[13.5px] text-gray-500 leading-relaxed mt-1.5">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* For brands band */}
      <section id="brands" className="py-20 bg-gray-900 text-white relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        <div className="relative max-w-5xl mx-auto px-6 grid md:grid-cols-[1.15fr_1fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-4">
              For brands &amp; agencies
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              Find verified creators.<br />Run campaigns that convert.
            </h3>
            <p className="text-gray-400 mt-4 max-w-md text-[15px] leading-relaxed">
              Post deals, discover niche-perfect streamers, and track applications in one workspace. Replace spreadsheets and cold outreach with a proper platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <Link href="/register/company" className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition">
                Create a brand page
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 hover:border-white/50 text-white font-semibold rounded-full transition">
                See brand pricing
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            {BRAND_BULLETS.map(({ Icon, text }) => (
              <div key={text} className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" strokeWidth={2.25} />
                </div>
                <div className="text-[13.5px] text-gray-200 font-medium leading-snug pt-1.5">{text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-[32px] md:text-4xl font-extrabold tracking-tight">Ready to grow your streaming career?</h2>
          <p className="text-gray-500 mt-4 text-[15px]">Join thousands of streamers already on StreamLink. Free forever.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/register" className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-full text-[14.5px] transition shadow-sm">
              Create your free profile
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold rounded-full text-[14.5px] transition">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-extrabold tracking-tight">
            <span className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white">
              <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
            </span>
            Stream<span className="text-accent">Link</span>
          </Link>
          <div className="flex items-center gap-5 text-[12.5px] font-semibold text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition">Platform</a>
            <Link href="/pricing" className="hover:text-gray-900 transition">Upgrade</Link>
            <Link href="/register/company" className="hover:text-gray-900 transition">For brands</Link>
          </div>
          <div className="md:ml-auto text-[11.5px] text-gray-400">
            © {new Date().getFullYear()} StreamLink · Built for streamers, by streamers.
          </div>
        </div>
      </footer>
    </div>
  )
}
