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
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] bg-violet-200/40 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 bg-white border border-gray-200 rounded-full text-[11.5px] font-bold uppercase tracking-wider text-gray-700 shadow-sm">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-accent-lt text-accent rounded-full">
                <Radio className="w-3 h-3" strokeWidth={2.5} />
              </span>
              Built for livestreamers
            </div>

            <h1 className="text-[44px] md:text-[56px] font-extrabold leading-[1.05] tracking-tight mt-6">
              The professional<br />
              <span className="bg-gradient-to-r from-accent to-violet-500 bg-clip-text text-transparent">home for streamers.</span>
            </h1>
            <p className="text-[15.5px] text-gray-500 leading-relaxed mt-5 max-w-lg">
              Connect with top streamers, land brand deals, find collaborators and track your growth — all in one professional network built for creators.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Link href="/register" className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-full transition shadow-sm">
                Create your free profile
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold rounded-full transition">
                Explore the feed
              </Link>
            </div>

            <div className="mt-7 flex items-center gap-2 text-[12.5px] text-gray-500">
              <Check className="w-4 h-4 text-emerald-500" strokeWidth={3} />
              <span>Free forever for streamers</span>
              <span className="mx-1 text-gray-300">·</span>
              <Check className="w-4 h-4 text-emerald-500" strokeWidth={3} />
              <span>No credit card required</span>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100">
              <div className="text-[10.5px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3">Works with your platforms</div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { Mark: TwitchMark, name: 'Twitch', cls: 'text-[#9146FF]' },
                  { Mark: KickMark, name: 'Kick', cls: 'text-[#53FC18]' },
                  { Mark: YouTubeMark, name: 'YouTube', cls: 'text-[#FF0033]' },
                ].map(({ Mark, name, cls }) => (
                  <div key={name} className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 bg-white border border-gray-200 rounded-full text-[12px] font-bold text-gray-700">
                    <Mark className={`w-3.5 h-3.5 ${cls}`} />
                    {name}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-10 mt-9 pt-8 border-t border-gray-100">
              {[
                ['42,000+', 'Streamers'],
                ['8,300',   'Live right now'],
                ['$2.4M',   'Deals closed'],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="text-[24px] font-extrabold tracking-tight">{n}</div>
                  <div className="text-[11.5px] text-gray-400 mt-0.5 font-semibold">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview cards */}
          <div className="relative">
            <div className="absolute inset-4 bg-gradient-to-br from-accent/5 via-violet-100/40 to-transparent rounded-3xl -z-10" />
            <div className="grid grid-cols-6 gap-3">
              <div className="col-span-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_4px_20px_-6px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white font-bold text-xs shadow-sm">SV</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-extrabold truncate">ShadowViper</span>
                      <BadgeCheck className="w-4 h-4 text-sky-500" fill="currentColor" strokeWidth={0} />
                    </div>
                    <div className="text-[10.5px] text-gray-400 font-semibold">Twitch Partner · Horror games</div>
                  </div>
                  <div className="text-[10px] bg-rose-50 text-rose-600 font-extrabold px-2 py-0.5 rounded-full tracking-wider">LIVE</div>
                </div>
                <p className="text-[13px] text-gray-700 leading-relaxed">
                  Just hit <strong className="text-gray-900">100,000 followers</strong> on Twitch! 3 years of late nights and horror games finally paid off.
                </p>
                <div className="flex items-center gap-5 mt-4 pt-3 border-t border-gray-100 text-gray-500">
                  <div className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold"><Heart className="w-3.5 h-3.5" strokeWidth={2.25} /> 3.2K</div>
                  <div className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold"><MessageCircle className="w-3.5 h-3.5" strokeWidth={2.25} /> 847</div>
                  <div className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold ml-auto"><Share2 className="w-3.5 h-3.5" strokeWidth={2.25} /> Share</div>
                </div>
              </div>

              <div className="col-span-3 bg-white border border-gray-200 rounded-2xl p-4 shadow-[0_4px_20px_-6px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-[10px]">NX</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-extrabold truncate">NeonXtra</div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
                      <KickMark className="w-3 h-3 text-[#53FC18]" />
                      Kick · FPS
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-violet-50 rounded-lg">
                  <Handshake className="w-3.5 h-3.5 text-violet-600" strokeWidth={2.25} />
                  <span className="text-[11.5px] font-semibold text-violet-700">Looking for duo collab</span>
                </div>
              </div>

              <div className="col-span-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 shadow-[0_4px_20px_-6px_rgba(15,23,42,0.08)]">
                <div className="inline-flex items-center gap-1 text-[9.5px] font-extrabold text-amber-700 uppercase tracking-wider bg-amber-100/60 px-2 py-0.5 rounded-full mb-2">
                  <DollarSign className="w-3 h-3" strokeWidth={2.5} />
                  Brand deal
                </div>
                <div className="text-[13px] font-extrabold">RedBull Gaming</div>
                <div className="text-[11px] text-gray-600 mt-0.5">FPS streamers 50K+ followers</div>
                <div className="text-[13px] font-extrabold text-amber-700 mt-2">$2,500 <span className="text-[10px] font-semibold text-amber-600">/ stream</span></div>
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
      <section id="features" className="py-24">
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
      <section id="brands" className="py-20 bg-gray-900 text-white relative overflow-hidden">
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
