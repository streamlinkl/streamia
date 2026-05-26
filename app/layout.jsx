import './globals.css'
import { Fraunces, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google'

// Display: editorial serif with optical sizing for hero headlines.
// Variable font — explicit weight array omitted so all weights are streamed.
const fontDisplay = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz'],
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

export const metadata = {
  metadataBase: new URL('https://streamia.co'),
  title: {
    default: 'StreamLink — Professional network for streamers',
    template: '%s · StreamLink',
  },
  description:
    'StreamLink is the professional home for livestreamers. Connect with top streamers, land brand deals, find collaborators and track your growth.',
  applicationName: 'StreamLink',
  keywords: ['streamers', 'livestream', 'creators', 'twitch', 'kick', 'youtube', 'brand deals', 'influencer'],
  openGraph: {
    title: 'StreamLink — Professional network for streamers',
    description:
      'Connect with top streamers, land brand deals, find collaborators and track your growth — all in one professional network built for creators.',
    url: 'https://streamia.co',
    siteName: 'StreamLink',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreamLink — Professional network for streamers',
    description: 'The professional home for livestreamers. Free forever for creators.',
  },
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'%3E%3Crect width='24' height='24' rx='6' fill='%230F172A'/%3E%3Cpath d='M13 3L5 14h5l-1 7 8-11h-5l1-7z' fill='%236C63FF'/%3E%3C/svg%3E",
        type: 'image/svg+xml',
      },
    ],
  },
}

export const viewport = {
  themeColor: '#6C63FF',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}
    >
      <body className="bg-bg text-gray-900 font-sans antialiased">{children}</body>
    </html>
  )
}
