'use client'
// Full-screen image viewer (QA #4 composer preview, #5 posted images).
// Click / tap the image to zoom 2.5× at that point; move to pan; wheel or
// pinch to zoom further; Esc, ✕ or the backdrop closes.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ZoomIn, ZoomOut } from 'lucide-react'

const MAX = 4

export default function ImageLightbox({ src, alt = '', onClose }) {
  const [scale, setScale] = useState(1)
  const [origin, setOrigin] = useState('50% 50%')
  const [mounted, setMounted] = useState(false)
  const pinch = useRef(null)

  useEffect(() => {
    setMounted(true)
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  const originFrom = (e, el) => {
    const r = el.getBoundingClientRect()
    return `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`
  }

  const onImageClick = (e) => {
    e.stopPropagation()
    if (scale > 1) { setScale(1); return }
    setOrigin(originFrom(e, e.currentTarget))
    setScale(2.5)
  }
  const onMove = (e) => { if (scale > 1 && e.pointerType === 'mouse') setOrigin(originFrom(e, e.currentTarget)) }
  const onWheel = (e) => {
    setOrigin(originFrom(e, e.currentTarget))
    setScale((s) => Math.min(MAX, Math.max(1, s * (e.deltaY < 0 ? 1.15 : 1 / 1.15))))
  }
  const dist = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
  const onTouchStart = (e) => { if (e.touches.length === 2) pinch.current = { d: dist(e.touches), s: scale } }
  const onTouchMove = (e) => {
    if (e.touches.length === 2 && pinch.current) {
      setScale(Math.min(MAX, Math.max(1, pinch.current.s * (dist(e.touches) / pinch.current.d))))
    }
  }

  if (!mounted) return null
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Image viewer" onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center overflow-hidden select-none">
      <div className="absolute top-3 right-3 flex gap-2 z-10" onClick={(e) => e.stopPropagation()}>
        <button type="button" aria-label="Zoom out" onClick={() => setScale((s) => Math.max(1, s / 1.5))}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center backdrop-blur">
          <ZoomOut className="w-5 h-5" strokeWidth={2} />
        </button>
        <button type="button" aria-label="Zoom in" onClick={() => setScale((s) => Math.min(MAX, s * 1.5))}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center backdrop-blur">
          <ZoomIn className="w-5 h-5" strokeWidth={2} />
        </button>
        <button type="button" aria-label="Close" onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center justify-center backdrop-blur">
          <X className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        onClick={onImageClick}
        onPointerMove={onMove}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={() => { pinch.current = null }}
        style={{ transform: `scale(${scale})`, transformOrigin: origin, touchAction: 'none' }}
        className={`max-w-[94vw] max-h-[90vh] object-contain transition-transform duration-150 ${scale > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
      />
    </div>,
    document.body,
  )
}
