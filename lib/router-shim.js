// react-router-dom shim for Next.js — keeps copy-pasted Vite pages working
import NextLink from 'next/link'
import { useRouter as useNextRouter, usePathname, useParams as useNextParams, useSearchParams as useNextSearchParams } from 'next/navigation'

export function Link(props) {
  const { to, ...rest } = props
  return <NextLink href={to} {...rest} />
}

export function useNavigate() {
  const r = useNextRouter()
  return (to, opts) => {
    if (typeof to === 'number') return r.back()
    if (opts?.replace) return r.replace(to)
    r.push(to)
  }
}

export function useParams() {
  return useNextParams() || {}
}

// Vite's useSearchParams returns [params, setParams]; Next.js returns params directly.
// Wrap so the destructuring `const [searchParams] = useSearchParams()` keeps working.
export function useSearchParams() {
  const sp = useNextSearchParams()
  const safe = sp ?? new URLSearchParams()
  const setSp = () => { /* no-op — Vite pages rarely set these from JS */ }
  return [safe, setSp]
}

export function useLocation() {
  const pathname = usePathname()
  const sp = useNextSearchParams()
  const s = sp?.toString()
  return { pathname, search: s ? `?${s}` : '' }
}

export const Navigate = ({ to, replace }) => {
  if (typeof window !== 'undefined') {
    if (replace) window.location.replace(to); else window.location.href = to
  }
  return null
}
