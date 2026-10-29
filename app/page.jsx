import Link from 'next/link'
import {
  ArrowRight, BadgeCheck, BarChart3, Building2, Calendar, Check, DollarSign, Handshake,
  Heart, MessageCircle, MessageSquare, Radio, Share2, Sparkles, Users,
} from 'lucide-react'
import { Suspense } from 'react'
import LoginScreen from '@/components/auth/LoginScreen'

// Brand marks — lucide doesn't ship Twitch/Kick/YouTube.
function TwitchMark({ className, style }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M2.149 0L.537 4.119v16.836h5.731V24h3.224l3.045-3.045h4.657L23.462 14.836V0zm19.164 13.761l-3.582 3.582h-5.731l-3.045 3.045v-3.045H4.134V2.149h17.179zm-3.582-7.164v6.567h-2.149V6.597zm-5.731 0v6.567H9.851V6.597z" />
    </svg>
  )
}
function YouTubeMark({ className, style }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}
function KickMark({ className, style }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden>
      <path d="M1.714 0h5.143v6.857h1.714v-3.43h1.715V1.714h1.714V0h6.857v5.143H17.14v1.714h-1.715v3.429h-1.714v3.428h1.714v3.429h1.715v1.714h1.714V24h-6.857v-1.714h-1.714v-1.715H8.571V17.14H6.857V24H1.714Z" />
    </svg>
  )
}

// Generic single-path brand mark (simple-icons style, 24×24, tinted via color prop).
function BrandMark({ path, className, style }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  )
}

// Platforms shown in the hero "Works with your platforms" strip.
// Existing three keep their dedicated marks; the rest use BrandMark with
// simple-icons path data, tinted to a brand colour with enough contrast on
// the light pill background.
const PLATFORMS = [
  { name: 'Twitch',   color: '#9146FF', Mark: TwitchMark },
  { name: 'Kick',     color: '#53FC18', Mark: KickMark },
  { name: 'YouTube',  color: '#FF0033', Mark: YouTubeMark },
  { name: 'TikTok',   color: '#0A0A0A', path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
  { name: 'Facebook Gaming', color: '#1877F2', path: 'M0 0v24h15.67v-7.35H7.35v-9.3H24V0zm8.33 15.68h8.32V24H24V8.32H8.33Z' },
  { name: 'Instagram', color: '#E4405F', path: 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077' },
  { name: 'Rumble',   color: '#85C742', path: 'M14.4528 13.5458c.8064-.6542.9297-1.8381.2756-2.6445a1.8802 1.8802 0 0 0-.2756-.2756 21.2127 21.2127 0 0 0-4.3121-2.776c-1.066-.51-2.256.2-2.4261 1.414a23.5226 23.5226 0 0 0-.14 5.5021c.116 1.23 1.292 1.964 2.372 1.492a19.6285 19.6285 0 0 0 4.5062-2.704v-.008zm6.9322-5.4002c2.0335 2.228 2.0396 5.637.014 7.8723A26.1487 26.1487 0 0 1 8.2946 23.846c-2.6848.6713-5.4168-.914-6.1662-3.5781-1.524-5.2002-1.3-11.0803.17-16.3045.772-2.744 3.3521-4.4661 6.0102-3.832 4.9242 1.174 9.5443 4.196 13.0764 8.0121v.002z' },
  { name: 'Niconico', color: '#252525', path: 'M.4787 7.534v12.1279A2.0213 2.0213 0 0 0 2.5 21.6832h2.3888l1.323 2.0948a.4778.4778 0 0 0 .4043.2205.4778.4778 0 0 0 .441-.2205l1.323-2.0948h6.9828l1.323 2.0948a.4778.4778 0 0 0 .441.2205c.1838 0 .3308-.0735.4043-.2205l1.323-2.0948h2.6462a2.0213 2.0213 0 0 0 2.0213-2.0213V7.5339a2.0213 2.0213 0 0 0-2.0213-1.9845h-7.681l4.4468-4.4469L17.1637 0l-5.1452 5.1452L6.8 0 5.6973 1.1025l4.4102 4.4102H2.5367a2.0213 2.0213 0 0 0-2.058 2.058z' },
  { name: 'Steam',    color: '#171A21', path: 'M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z' },
  { name: 'Snapchat', color: '#0A0A0A', path: 'M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z' },
  { name: 'X',        color: '#0A0A0A', path: 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z' },
  { name: 'Discord',  color: '#5865F2', path: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z' },
  // Official partner logos (full wordmark / icon assets) — rendered as <img>.
  { name: 'Trovo',     logo: '/brand/platforms/trovo.svg' },
  { name: 'DLive',     logo: '/brand/platforms/dlive.svg' },
  // Bigo's official mark is its mascot (no inline name) — pair it with a label.
  { name: 'Bigo Live', logoIcon: '/brand/platforms/bigo.png' },
]

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
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink focus:text-white focus:rounded-full focus:font-semibold focus:text-caption">Skip to content</a>
      <main id="main-content">
      {/* Hero — Oct 2026 login screen (Figma "StreamLink | Landing Login" → Aprovado → Login).
          Replaces the June 2026 split hero + top nav; sections below are unchanged. */}
      <Suspense fallback={null}>
        <LoginScreen />
      </Suspense>

      {/* Platform strip — keeps the "works with your platforms" promise under the hero */}
      <section aria-label="Supported platforms" className="pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-14">
          <div className="text-micro font-mono font-semibold uppercase text-muted mb-3">Works with your platforms</div>
          <div className="flex flex-wrap items-center gap-2">
            {PLATFORMS.map(({ name, color, Mark, path, logo, logoIcon }) =>
              logo ? (
                <div key={name} className="inline-flex items-center px-3 py-1.5 border border-rule rounded-full bg-paper">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo} alt={name} className="h-4 w-auto" />
                </div>
              ) : (
                <div key={name} className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-1.5 border border-rule rounded-full text-caption font-semibold text-ink bg-paper">
                  {logoIcon
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={logoIcon} alt="" className="w-4 h-4 object-contain" />
                    : Mark
                      ? <Mark className="w-3.5 h-3.5" style={{ color }} />
                      : <BrandMark path={path} className="w-3.5 h-3.5" style={{ color }} />}
                  {name}
                </div>
              )
            )}
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
            <h2 className="font-display text-h2 sm:text-h2-lg text-white leading-tight">
              Find verified creators.<br />
              <em className="italic text-white/70 font-medium">Run campaigns that convert.</em>
            </h2>
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

      </main>

      {/* Footer */}
      <footer className="border-t border-rule bg-paper">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center gap-6">
          <Link href="/" aria-label="StreamLink — home" className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-md">
            <img src="/brand/logo-wordmark.svg" alt="StreamLink" className="h-6 w-auto" />
          </Link>
          <nav aria-label="Footer" className="flex items-center gap-6 text-caption font-mono font-semibold uppercase text-muted">
            <a href="#features" className="hover:text-ink transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm">Platform</a>
            <Link href="/pricing" className="hover:text-ink transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm">Upgrade</Link>
            <Link href="/register/company" className="hover:text-ink transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm">For brands</Link>
            <a href="mailto:support@streamia.co" className="hover:text-ink transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm">Support</a>
          </nav>
          <div className="md:ml-auto text-micro font-mono text-muted">
            © {new Date().getFullYear()} · Built for streamers, by streamers
          </div>
        </div>
      </footer>
    </div>
  )
}
