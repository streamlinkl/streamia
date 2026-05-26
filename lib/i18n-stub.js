// Minimal i18n stub for Faz 5 — full react-i18next ports in Faz 9.
// Returns the key (or fallback) so UI stays in English without a real i18n layer.
export function useTranslation() {
  return {
    t: (key, opts) => {
      if (opts && opts.returnObjects) return []
      // Fallback nicely on "x.y.z" → return last segment when nothing better.
      return typeof key === 'string' ? key.split('.').pop() : key
    },
    i18n: { language: 'en', changeLanguage: () => {} },
  }
}
