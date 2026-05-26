'use client'
import { Star } from 'lucide-react'

export default function StarRating({ value = 0, onChange, size = 16, max = 5, className = '' }) {
  const interactive = typeof onChange === 'function'
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: max }).map((_, i) => {
        const n = i + 1
        const active = n <= Math.round(value)
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={interactive ? () => onChange(n) : undefined}
            className={`transition ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
            aria-label={`${n} stars`}>
            <Star
              className={active ? 'text-amber-400' : 'text-gray-300'}
              width={size}
              height={size}
              fill={active ? 'currentColor' : 'none'}
              strokeWidth={2}
            />
          </button>
        )
      })}
    </div>
  )
}
