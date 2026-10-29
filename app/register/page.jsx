import { Suspense } from 'react'
import Component from '@/components/auth/Register'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  )
}
