import './globals.css'

export const metadata = {
  title: 'StreamLink — Professional network for streamers',
  description: 'StreamLink is the professional home for livestreamers.',
  themeColor: '#6C63FF',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-bg text-gray-900 font-sans antialiased">{children}</body>
    </html>
  )
}
