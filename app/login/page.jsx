import { Suspense } from 'react'
import LoginScreen from '@/components/auth/LoginScreen'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  )
}
