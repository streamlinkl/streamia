import Network from '@/components/network/Network'

export const dynamic = 'force-dynamic'

export default function NetworkPage() {
  // Data fetched on the client to keep this fast — Network has 4 tabs and
  // it'd be wasteful to prefetch everything on the server.
  return <Network />
}
