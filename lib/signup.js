// Option lists + helpers for the Oct 2026 signup redesign
// (Figma "StreamLink | Landing Login" → Aprovado).

// Streamer "Platforms" chips. Slugs match the API's platforms table so they
// render as profile badges; labels follow the design.
export const STREAMER_PLATFORMS = [
  { slug: 'twitch', label: 'Twitch' },
  { slug: 'youtube-live', label: 'YouTube' },
  { slug: 'kick', label: 'Kick' },
  { slug: 'tiktok-live', label: 'TikTok Live' },
  { slug: 'facebook-live', label: 'Facebook Gaming' },
  { slug: 'instagram-live', label: 'Instagram Live' },
]

// Streamer "Category" select (stored in profiles.category).
export const STREAMER_CATEGORIES = [
  'Gaming',
  'Just Chatting',
  'IRL',
  'Esports',
  'Music',
  'Creative & Art',
  'Sports',
  'Talk Shows & Podcasts',
  'Education',
  'Tech',
  'Fitness',
  'Cooking',
  'Travel & Outdoors',
  'Other',
]

// Influencer "Content niches" chips (stored in profiles.content_categories).
export const INFLUENCER_NICHES = [
  'Gaming',
  'Lifestyle',
  'Fashion & Beauty',
  'Food & Cooking',
  'Fitness & Health',
  'Travel',
  'Tech & Gadgets',
  'Finance',
  'Education',
  'Entertainment',
  'Music',
  'Parenting',
  'Sports',
]

// Brand wizard — step 2.
export const INDUSTRIES = [
  'Esports', 'Gaming Hardware', 'Energy & Beverages', 'Streaming Platform',
  'Talent Agency', 'Game Publisher', 'Apparel', 'Tech & Software',
  'Food & Beverage', 'Finance & Crypto', 'Health & Fitness', 'Other',
]

export const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–1,000', '1,000+']

// Brand wizard — step 3 (stored in companies.looking_for / budget_range).
export const PARTNERSHIP_TYPES = [
  'Sponsored posts',
  'Long-term ambassadors',
  'Product reviews',
  'Giveaways',
  'Live activations',
  'Event appearances',
  'Affiliate programs',
  'Co-created content',
]

export const BUDGET_RANGES = [
  'Under $1,000',
  '$1,000 – $5,000',
  '$5,000 – $20,000',
  '$20,000 – $50,000',
  '$50,000+',
]

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Strip accents (incl. Turkish dotless ı) so "Şebnem Yılmaz" → "sebnemyilmaz".
function asciiSlug(s) {
  return (s || '')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/**
 * The redesigned forms don't ask for a handle, but the API requires one
 * (3–20 chars, [a-z0-9_]). Derive it from the name (or email) plus a short
 * random suffix; the user can change it later in Settings.
 */
export function generateHandle(firstName, lastName, email) {
  let base = asciiSlug(`${firstName}${lastName}`) || asciiSlug((email || '').split('@')[0]) || 'creator'
  if (base.length < 3) base = `${base}creator`
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base.slice(0, 14)}_${suffix}`
}

/** Only follow same-site relative paths from ?next= (no open redirects). */
export function safeNext(next, fallback = '/feed') {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : fallback
}

/** Preselect country / language from the browser locale when we support it. */
export function localeDefaults(countries, languages) {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || ''
    const [lang, region] = locale.split('-')
    return {
      country: countries.some((c) => c.code === region) ? region : 'TR',
      language: languages.some((l) => l.code === lang) ? lang : 'en',
    }
  } catch {
    return { country: 'TR', language: 'en' }
  }
}
