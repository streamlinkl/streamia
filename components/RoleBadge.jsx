/**
 * RoleBadge — a small coloured pill that surfaces the account type
 * (docx task #1). Backend stores 4 roles on users.role:
 *
 *   'streamer'   → STREAMER (purple)
 *   'influencer' → INFLUENCER (orange)
 *   'company'    → BRAND (sky blue) — legacy column name; the docx
 *                  refers to this audience as "Brand", and the registration
 *                  flow for a company account is /register/company.
 *   'agency'     → AGENCY (pink) — added in docx task #2.
 *
 * Unknown / falsy roles render nothing (safe default — avoids polluting
 * pre-existing profiles that have no role set yet).
 */

const ROLE_STYLES = {
  influencer: { label: 'INFLUENCER', bg: '#FF6B35', fg: '#FFFFFF' },
  streamer:   { label: 'STREAMER',   bg: '#7B2FBE', fg: '#FFFFFF' },
  company:    { label: 'BRAND',      bg: '#00BFFF', fg: '#FFFFFF' },
  brand:      { label: 'BRAND',      bg: '#00BFFF', fg: '#FFFFFF' }, // alias
  agency:     { label: 'AGENCY',     bg: '#FF69B4', fg: '#FFFFFF' },
}

const SIZE_STYLES = {
  sm: 'px-2 py-0.5 text-[9.5px]',
  md: 'px-2.5 py-0.5 text-[10.5px]',
  lg: 'px-3 py-1 text-[11.5px]',
}

export default function RoleBadge({ role, size = 'md', className = '' }) {
  const key = typeof role === 'string' ? role.toLowerCase() : null
  const style = key ? ROLE_STYLES[key] : null
  if (!style) return null
  return (
    <span
      className={`inline-flex items-center font-extrabold uppercase tracking-wider rounded-full leading-none whitespace-nowrap ${SIZE_STYLES[size] || SIZE_STYLES.md} ${className}`}
      style={{ backgroundColor: style.bg, color: style.fg }}
      aria-label={`Account type: ${style.label.toLowerCase()}`}
    >
      {style.label}
    </span>
  )
}
