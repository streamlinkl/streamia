'use client'
// Post image (QA #5): keep the whole picture visible inside an Instagram-style
// frame — the box follows the image's own ratio, clamped between 4:5 (portrait)
// and 1.91:1 (landscape); anything outside that range is letterboxed, never
// cropped. Clicking opens the zoomable viewer.
import { useState } from 'react'
import ImageLightbox from '@/components/ImageLightbox'

const MIN_RATIO = 4 / 5
const MAX_RATIO = 1.91

export default function PostImage({ src, alt = '' }) {
  const [ratio, setRatio] = useState(null)
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Open image"
        className="block w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50 cursor-zoom-in"
        style={{ aspectRatio: ratio ?? 16 / 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy"
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget
            if (w && h) setRatio(Math.min(MAX_RATIO, Math.max(MIN_RATIO, w / h)))
          }}
          className="w-full h-full object-contain" />
      </button>
      {open && <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  )
}
