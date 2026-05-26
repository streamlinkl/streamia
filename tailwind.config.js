/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Resolves to next/font CSS variables defined in app/layout.jsx,
        // with Plus Jakarta Sans kept as a fallback so legacy pages don't
        // visually break if a variable fails to load.
        sans: ['var(--font-sans)', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        // Editorial type scale — page.jsx will migrate ad-hoc text-[NNpx] to these.
        'micro':    ['0.6875rem',  { lineHeight: '1.1', letterSpacing: '0.12em' }], // 11px eyebrow caps
        'label':    ['0.75rem',    { lineHeight: '1.15', letterSpacing: '0.08em' }],// 12px mono label
        'caption':  ['0.8125rem',  { lineHeight: '1.45' }], // 13px
        'body':     ['0.9375rem',  { lineHeight: '1.6' }],  // 15px
        'lede':     ['1.0625rem',  { lineHeight: '1.55' }], // 17px hero lead
        'h3':       ['1.375rem',   { lineHeight: '1.2', letterSpacing: '-0.01em' }], // 22px
        'h2':       ['1.875rem',   { lineHeight: '1.1', letterSpacing: '-0.015em' }],// 30px
        'h2-lg':    ['2.5rem',     { lineHeight: '1.05', letterSpacing: '-0.02em' }],// 40px
        'display':  ['3rem',       { lineHeight: '1.02', letterSpacing: '-0.025em' }],// 48px
        'display-lg':['4.25rem',   { lineHeight: '0.98', letterSpacing: '-0.03em' }],// 68px
      },
      colors: {
        // Editorial palette — new additive tokens, existing kept untouched.
        ink:    '#0A0A0A',
        paper:  '#FAFAF7',
        rule:   '#E6E4DC',
        muted:  '#6B6960',
        // Existing palette (do not remove — used across login/pricing/feed/etc.):
        accent: '#6C63FF',
        'accent-lt': '#f0efff',
        'accent-dk': '#5a52e0',
        live: '#e63946',
        twitch: '#9146FF',
        kick: '#2ea04a',
        youtube: '#cc0000',
        bg: '#f3f2ef',
      },
      boxShadow: {
        // Single soft shadow token — replaces ad-hoc shadow-[0_4px_...] across page.jsx.
        card: '0 1px 0 rgba(10,10,10,0.04), 0 8px 28px -16px rgba(10,10,10,0.10)',
      },
    },
  },
  plugins: [],
}
