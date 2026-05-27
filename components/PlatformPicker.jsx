'use client'
import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { platformApi } from '@/lib/api-client'

const CATEGORY_LABELS = {
  major:          'Major Platforms',
  asia:           'Asia Markets',
  social_stream:  'Social Streaming',
  video_chat:     'Video Chat',
  social_dating:  'Social / Dating',
  adult:          'Adult',
  regional:       'Regional',
  audio:          'Audio & Podcast',
  tools:          'Broadcast Tools',
}
const CATEGORY_ORDER = ['major', 'asia', 'social_stream', 'video_chat', 'social_dating', 'adult', 'regional', 'audio', 'tools']

export default function PlatformPicker({ value = [], onChange, max = 30, compact = false }) {
  const [platforms, setPlatforms] = useState(null)
  const [err, setErr] = useState('')
  const [query, setQuery] = useState('')
  const [openCats, setOpenCats] = useState(() => new Set(['major']))

  useEffect(() => {
    let cancelled = false
    platformApi.list()
      .then((list) => { if (!cancelled) setPlatforms(list) })
      .catch((e) => { if (!cancelled) setErr(e.message || 'Failed to load platforms') })
    return () => { cancelled = true }
  }, [])

  const grouped = useMemo(() => {
    if (!platforms) return {}
    const q = query.trim().toLowerCase()
    const filtered = q ? platforms.filter((p) => p.name.toLowerCase().includes(q) || p.slug.includes(q)) : platforms
    return CATEGORY_ORDER.reduce((acc, cat) => {
      const items = filtered.filter((p) => p.category === cat)
      if (items.length > 0) acc[cat] = items
      return acc
    }, {})
  }, [platforms, query])

  const selectedSet = useMemo(() => new Set(value), [value])

  const toggle = (slug) => {
    const next = new Set(selectedSet)
    if (next.has(slug)) next.delete(slug)
    else {
      if (next.size >= max) return
      next.add(slug)
    }
    onChange?.([...next])
  }

  const toggleCat = (cat) => {
    const next = new Set(openCats)
    if (next.has(cat)) next.delete(cat)
    else next.add(cat)
    setOpenCats(next)
  }

  const expandAll = () => setOpenCats(new Set(CATEGORY_ORDER))
  const collapseAll = () => setOpenCats(new Set())

  if (err) return <div className="text-xs text-red-500 font-semibold">{err}</div>
  if (!platforms) return <div className="text-xs text-gray-400">Loading platforms…</div>

  // Render selected slugs as chips at the top
  const selectedChips = value
    .map((slug) => platforms.find((p) => p.slug === slug))
    .filter(Boolean)

  return (
    <div className={compact ? '' : 'border border-gray-200 rounded-xl p-3 bg-white'}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" strokeWidth={2.25} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search platforms…"
            className="w-full h-9 pl-8 pr-3 bg-bg border border-gray-200 rounded-full text-[12.5px] outline-none focus:border-accent"
          />
        </div>
        <button type="button" onClick={expandAll}   className="text-[11px] font-bold text-gray-500 hover:text-gray-900">Expand all</button>
        <button type="button" onClick={collapseAll} className="text-[11px] font-bold text-gray-400 hover:text-gray-900">Collapse</button>
      </div>

      {selectedChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b border-gray-100">
          {selectedChips.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => toggle(p.slug)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent-lt text-accent rounded-full text-[11px] font-bold hover:bg-accent hover:text-white transition"
              style={p.brandColor ? { color: p.brandColor, backgroundColor: `${p.brandColor}14` } : undefined}
            >
              {p.name}
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          ))}
          <span className="ml-auto text-[10.5px] text-gray-400 font-semibold">
            {value.length}/{max}
          </span>
        </div>
      )}

      <div className="space-y-1.5 max-h-80 overflow-y-auto">
        {CATEGORY_ORDER.map((cat) => {
          const items = grouped[cat]
          if (!items) return null
          const open = openCats.has(cat) || query.trim().length > 0
          return (
            <div key={cat} className="border border-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition rounded-lg"
              >
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? '' : '-rotate-90'}`} strokeWidth={2.5} />
                <span className="text-[12.5px] font-extrabold">{CATEGORY_LABELS[cat] || cat}</span>
                <span className="ml-auto text-[10.5px] text-gray-400 font-bold">{items.length}</span>
              </button>
              {open && (
                <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                  {items.map((p) => {
                    const sel = selectedSet.has(p.slug)
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => toggle(p.slug)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11.5px] font-semibold text-left transition
                          ${sel ? 'bg-accent-lt text-accent ring-1 ring-accent/30' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: p.brandColor || '#9CA3AF' }}
                        />
                        <span className="flex-1 truncate">{p.name}</span>
                        {sel && <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={2.5} />}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        {Object.keys(grouped).length === 0 && (
          <div className="text-[12px] text-gray-400 text-center py-6">No results</div>
        )}
      </div>
    </div>
  )
}
