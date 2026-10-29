import './globals.css'
import { Epilogue, Hanken_Grotesk, Inter, JetBrains_Mono, Sen } from 'next/font/google'

// Display: Epilogue — modern variable grotesk with true italics for hero
// headlines. Replaces Fraunces (serif) to better fit the contemporary,
// creator-focused page. Includes italic for the emphasized hero words.
const fontDisplay = Epilogue({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  style: ['normal', 'italic'],
})

// Body: Hanken Grotesk — characterful neo-grotesque, replaces Plus Jakarta Sans.
const fontSans = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

// Mono: JetBrains Mono — eyebrow labels, oversized counters, code-feel detail.
const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

// Login / signup redesign (Oct 2026, Figma "StreamLink | Landing Login"):
// Sen for the signup forms, Inter for the login card + hero copy. Only the
// auth pages use them, so they aren't preloaded on every route.
const fontSen = Sen({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sen',
  display: 'swap',
  preload: false,
})

const fontInter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  preload: false,
})

export const metadata = {
  metadataBase: new URL('https://streamia.co'),
  title: {
    default: 'StreamLink — The network built for creators, streamers & brands',
    template: '%s · StreamLink',
  },
  description:
    'StreamLink is the social network where livestreamers, influencers, agencies, and brands connect, showcase achievements, discover opportunities, and build powerful partnerships.',
  applicationName: 'StreamLink',
  keywords: ['streamers', 'livestream', 'creators', 'influencers', 'agencies', 'brands', 'twitch', 'kick', 'youtube', 'brand deals', 'collaboration'],
  openGraph: {
    title: 'StreamLink — The network built for creators, streamers & brands',
    description:
      'Connect. Collaborate. Grow. The social network where livestreamers, influencers, agencies, and brands connect, showcase achievements, and build powerful partnerships.',
    url: 'https://streamia.co',
    siteName: 'StreamLink',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreamLink — The network built for creators, streamers & brands',
    description: 'Connect. Collaborate. Grow. Find your next collaboration, build your reputation, and monetize your audience.',
  },
  icons: {
    icon: [
      { url: '/brand/icon.svg', type: 'image/svg+xml' },
    ],
  },
}

export const viewport = {
  // White (was #7C3AED) — Safari fills the overscroll area above the document
  // with the theme-color, which looked like a purple bar pinned to the top of
  // the landing nav. Lara's June 2026 design wants this surface to read white.
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} ${fontSen.variable} ${fontInter.variable}`}
    >
      <body className="bg-bg text-gray-900 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
