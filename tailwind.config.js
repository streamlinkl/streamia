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
        display: ['var(--font-display)', '"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        // Auth redesign (Oct 2026). Trap isn't on Google Fonts — see the
        // @font-face note in globals.css; until its files ship we fall back
        // to the display face.
        trap: ['Trap', 'var(--font-display)', 'system-ui', 'sans-serif'],
        sen: ['var(--font-sen)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
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
        muted:  '#585650',
        // Existing palette (do not remove — used across login/pricing/feed/etc.):
        // Brand pink ("StreamLink pembe") — the single UI accent for buttons,
        // tabs, links, rings. Replaced the old graduation purple (#7C3AED) per
        // Lara's 26.07 feedback: all clickable elements use the new colour set.
        accent: '#E8347A',
        'accent-lt': '#FDE7F1',
        'accent-dk': '#C81E63',
        // Deeper magenta for hover states + focus rings.
        'accent-pink': '#C026D3',
        // Lara brand palette (June 2026) — official SVG asset colors.
        'sl-orange': '#F4622A',
        'sl-pink':   '#E8347A',
        'sl-purple': '#7C3AED',
        live: '#e63946',
        twitch: '#9146FF',
        kick: '#2ea04a',
        youtube: '#cc0000',
        bg: '#f3f2ef',
        // Auth redesign (Oct 2026) — one colour per account type + the
        // near-black primary button of the signup forms.
        'role-streamer': '#F58635',
        'role-influencer': '#9F07D0',
        'role-brand': '#003EBA',
        cta: '#1A1A1A',
      },
      backgroundImage: {
        // Warm sunset iridescent — default avatar fallback + "graduate" brand moments.
        // Matches WhatsApp reference image 1 (yellow → coral → magenta → violet).
        'graduate':
          'conic-gradient(from 220deg at 30% 30%, #FFD66B 0deg, #FFB199 70deg, #FF8FA3 140deg, #E55BD0 210deg, #9D6BFF 280deg, #FFD66B 360deg)',
        'graduate-radial':
          'radial-gradient(circle at 30% 30%, #FFE07A 0%, #FFB199 22%, #FF8FA3 40%, #E55BD0 60%, #9D6BFF 90%)',
        // Soft pastel cool — hero banners + decorative banners.
        // Matches WhatsApp reference image 2 (cream → pink → peach → lavender).
        'aurora':
          'radial-gradient(circle at 60% 30%, #DCE9FF 0%, #FFD4D8 35%, #FFB199 55%, #E9D4FF 80%)',
        // Lara's official Streamlink gradient (orange → pink → purple).
        'streamlink':
          'linear-gradient(110deg, #F4622A 0%, #E8347A 48%, #7C3AED 100%)',
        // Auth redesign (Oct 2026): hero headline gradient + Sign in button.
        'sl-headline':
          'linear-gradient(90deg, #F58635 0%, #FB523C 14%, #FE045D 29%, #EB4E8D 46%, #BE70EC 63%, #9F07D0 83%, #003EBA 100%)',
        'sl-signin': 'linear-gradient(90deg, #F58635 0%, #EB4E8D 100%)',
      },
      boxShadow: {
        // Single soft shadow token — replaces ad-hoc shadow-[0_4px_...] across page.jsx.
        card: '0 1px 0 rgba(10,10,10,0.04), 0 8px 28px -16px rgba(10,10,10,0.10)',
        // Subtle outer glow used under the brand mark for a "3D" feel.
        'graduate-glow': '0 12px 32px -8px rgba(229,91,208,0.35), 0 8px 24px -12px rgba(157,107,255,0.30)',
      },
    },
  },
  plugins: [],
}
