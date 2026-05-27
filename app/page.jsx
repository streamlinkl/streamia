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
  { key: 'network',   no: '01', Icon: Handshake,
    title: 'Professional Network',
    desc: 'Connect with thousands of verified streamers, find collab partners and build a real creator community.' },
  { key: 'deals',     no: '02', Icon: DollarSign,
    title: 'Brand Partnerships',
    desc: 'Get matched with brands actively hiring creators. Apply, negotiate and close deals in one place.' },
  { key: 'analytics', no: '03', Icon: BarChart3,
    title: 'Channel Analytics',
    desc: 'Track your growth, viewer stats and revenue trends in a dashboard built for creators.' },
  { key: 'messaging', no: '04', Icon: MessageSquare,
    title: 'Direct Messaging',
    desc: 'DM any streamer, brand or agency. No middleman, no cold emails — just conversations.' },
  { key: 'companies', no: '05', Icon: Building2,
    title: 'Company Pages',
    desc: 'Discover agencies and brands looking for creators in your niche with verified company profiles.' },
  { key: 'schedule',  no: '06', Icon: Calendar,
    title: 'Stream Schedule',
    desc: 'Share your go-live calendar, let fans subscribe to reminders and plan collabs with ease.' },
]

const BRAND_BULLETS = [
  { Icon: Users, text: 'Verified streamers across every niche' },
  { Icon: BadgeCheck, text: 'Authenticated Twitch, Kick and YouTube profiles' },
  { Icon: BarChart3, text: 'Real-time campaign analytics' },
  { Icon: MessageSquare, text: 'Direct messaging with creators, zero commissions' },
]

export default function Page() {
  return (
    <div className="min-h-screen bg-white font-sans text-ink">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-paper/85 backdrop-blur border-b border-rule">
        <div className="max-w-6xl mx-auto h-16 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-bold tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-md">
            <span className="w-9 h-9 bg-ink rounded-xl flex items-center justify-center text-white" aria-hidden>
              <Zap className="w-4 h-4" strokeWidth={2.5} />
            </span>
            Stream<span className="text-accent">Link</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 ml-10 text-caption text-muted font-semibold">
            <a href="#features" className="hover:text-ink transition focus-visible:outline-none focus-visible:text-ink">Platform</a>
            <a href="#brands" className="hover:text-ink transition focus-visible:outline-none focus-visible:text-ink">For brands &amp; agencies</a>
            <Link href="/pricing" className="hover:text-ink transition focus-visible:outline-none focus-visible:text-ink">Upgrade</Link>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/login" className="px-3 py-1.5 text-caption font-semibold text-muted hover:text-ink transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-full">Sign in</Link>
            <Link href="/register" className="group inline-flex items-center gap-1.5 px-4 py-2 bg-ink hover:bg-black text-white text-caption font-semibold rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              Get started
              <ArrowRight className="w-3.5 h-3.5 -mr-0.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} aria-hidden />
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

      {/* Trust strip — editorial imprint */}
      <section className="border-y border-rule bg-paper">
        <div className="max-w-6xl mx-auto px-6 py-7 flex items-center gap-x-8 gap-y-4 flex-wrap">
          <span className="text-micro font-mono font-semibold uppercase text-muted">Trusted by creators<br className="hidden sm:inline" /> partnered with</span>
          <div className="flex-1 flex items-center justify-start sm:justify-end gap-x-7 gap-y-3 flex-wrap">
            {['RedBull', 'Logitech', 'NVIDIA', 'SteelSeries', 'Razer', 'ASUS ROG'].map((b) => (
              <span key={b} className="text-caption font-semibold tracking-tight text-ink/70">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 scroll-mt-20 border-t border-rule">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 text-micro font-mono font-semibold uppercase text-muted mb-4">
            <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={2} aria-hidden />
            <span>Platform · 06 modules</span>
          </div>
          <h2 className="font-display text-h2 sm:text-h2-lg text-ink">Everything a streamer needs,<br className="hidden sm:inline" /> <em className="italic text-accent-dk font-medium">in one place.</em></h2>
          <p className="text-muted mt-4 text-lede max-w-xl">One platform, your entire streaming career — discover, connect, negotiate, broadcast, grow.</p>
        </div>
        <div className="max-w-5xl mx-auto px-6 mt-14 grid md:grid-cols-2 lg:grid-cols-3 border-t border-l border-rule">
          {FEATURES.map(({ key, no, Icon, title, desc }) => (
            <div key={key} className="group relative p-7 border-r border-b border-rule bg-paper transition hover:bg-white">
              <div className="flex items-start justify-between mb-10">
                <div className="font-display text-[44px] leading-none text-muted/30 group-hover:text-accent transition tracking-tight tabular-nums" aria-hidden>{no}</div>
                <Icon className="w-5 h-5 text-muted group-hover:text-ink transition" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="font-semibold text-h3 text-ink">{title}</div>
              <div className="text-body text-muted leading-relaxed mt-2">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* For brands band */}
      <section id="brands" className="py-24 bg-ink text-white relative overflow-hidden scroll-mt-20">
        <div className="relative max-w-5xl mx-auto px-6 grid md:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 text-micro font-mono font-semibold uppercase text-white/60 mb-5">
              <span className="w-6 h-px bg-white/40" aria-hidden />
              For brands &amp; agencies
            </div>
            <h3 className="font-display text-h2 sm:text-h2-lg text-white leading-tight">
              Find verified creators.<br />
              <em className="italic text-white/70 font-medium">Run campaigns that convert.</em>
            </h3>
            <p className="text-white/60 mt-5 max-w-md text-lede leading-relaxed">
              Post deals, discover niche-perfect streamers, and track applications in one workspace. Replace spreadsheets and cold outreach with a proper platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link href="/register/company" className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-ink font-semibold rounded-full hover:bg-paper transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
                Create a brand page
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} aria-hidden />
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/25 hover:border-white text-white font-semibold rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
                See brand pricing
              </Link>
            </div>
          </div>
          <ul className="border-t border-white/15">
            {BRAND_BULLETS.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-4 py-4 border-b border-white/15">
                <Icon className="w-4 h-4 mt-1 text-white/70 flex-shrink-0" strokeWidth={1.75} aria-hidden />
                <div className="text-body text-white/85 leading-snug">{text}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 text-center border-t border-rule">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-micro font-mono font-semibold uppercase text-muted mb-5">— Start free, forever —</div>
          <h2 className="font-display text-h2 sm:text-h2-lg text-ink">
            Ready to grow your{' '}
            <em className="italic text-accent-dk font-medium">streaming</em>{' '}
            career?
          </h2>
          <p className="text-muted mt-4 text-lede">Join the streamers already on StreamLink.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9">
            <Link href="/register" className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-ink hover:bg-black text-white font-semibold rounded-full text-body transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white">
              Create your free profile
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} aria-hidden />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-rule hover:border-ink text-ink font-semibold rounded-full text-body transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rule bg-paper">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-md">
            <span className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center text-white" aria-hidden>
              <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
            </span>
            Stream<span className="text-accent">Link</span>
          </Link>
          <div className="flex items-center gap-6 text-caption font-mono font-semibold uppercase text-muted">
            <a href="#features" className="hover:text-ink transition">Platform</a>
            <Link href="/pricing" className="hover:text-ink transition">Upgrade</Link>
            <Link href="/register/company" className="hover:text-ink transition">For brands</Link>
          </div>
          <div className="md:ml-auto text-micro font-mono text-muted">
            © {new Date().getFullYear()} · Built for streamers, by streamers
          </div>
        </div>
      </footer>
    </div>
  )
}
