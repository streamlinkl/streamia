'use client'
// Shared building blocks for the Oct 2026 signup screens (Figma "StreamLink |
// Landing Login" → Aprovado). Measurements follow the Figma frames: 560px
// column, Trap headings, Sen body, 42px fields, 46px near-black CTA.
import Link from 'next/link'
import { Check, ChevronDown, ChevronLeft, CircleDot, Loader2 } from 'lucide-react'

export const ROLE_COLORS = {
  streamer: '#F58635',
  influencer: '#9F07D0',
  brand: '#003EBA',
}

/** Page frame: back chevron + wordmark on top, centered 560px column below. */
export function SignupShell({ backHref, onBack, wide = false, children }) {
  const back = (
    <span className="inline-flex items-center justify-center w-5 h-5 text-black/30 group-hover:text-black/60 transition">
      <ChevronLeft className="w-5 h-5" strokeWidth={1.8} aria-hidden />
    </span>
  )
  return (
    <div className="min-h-screen bg-white font-sen text-black flex flex-col">
      <header className="flex items-center gap-6 px-6 sm:px-14 pt-8 sm:pt-12">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Back" className="group">{back}</button>
        ) : backHref ? (
          <Link href={backHref} aria-label="Back" className="group">{back}</Link>
        ) : (
          <span className="w-5" aria-hidden />
        )}
        <Link href="/" aria-label="StreamLink — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-wordmark.svg" alt="StreamLink" className="h-[26px] sm:h-[33px] w-auto" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12 sm:py-16">
        <div className={`w-full ${wide ? 'max-w-[760px]' : 'max-w-[560px]'}`}>{children}</div>
      </main>
    </div>
  )
}

/** "◉ STREAMER" label above the form title. */
export function Eyebrow({ color, children }) {
  return (
    <div className="flex items-center gap-2 text-[11px] leading-4 font-semibold uppercase tracking-[0.11em]" style={{ color }}>
      <CircleDot className="w-3 h-3" strokeWidth={2.4} aria-hidden />
      {children}
    </div>
  )
}

export function FormTitle({ title, subtitle }) {
  return (
    <>
      <h1 className="font-trap font-black text-[28px] sm:text-[32px] leading-[1.5] text-black mt-3">{title}</h1>
      {subtitle ? <p className="text-[14px] leading-[21px] text-black/65 pt-1">{subtitle}</p> : null}
    </>
  )
}

export function FieldLabel({ htmlFor, children, hint }) {
  return (
    <label htmlFor={htmlFor} className="flex items-baseline gap-2 text-[10.5px] leading-4 font-bold uppercase tracking-[0.07em] text-black/50">
      {children}
      {hint ? <span className="normal-case tracking-normal font-semibold text-black/35">{hint}</span> : null}
    </label>
  )
}

function FieldError({ children }) {
  return children ? <p className="text-[11.5px] leading-4 text-red-600 font-semibold">{children}</p> : null
}

const fieldBase =
  'w-full rounded-[10px] border bg-black/[0.04] text-[13px] text-black placeholder:text-black/40 outline-none transition focus:bg-white'

function fieldBorder(error) {
  return error ? 'border-red-500 focus:border-red-500' : 'border-black/[0.12] focus:border-black/40'
}

export function TextField({ id, label, error, className = '', ...input }) {
  return (
    <div className={`flex flex-col gap-[5px] ${className}`}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input id={id} className={`${fieldBase} ${fieldBorder(error)} h-[42px] px-3.5`} aria-invalid={!!error} {...input} />
      <FieldError>{error}</FieldError>
    </div>
  )
}

export function TextArea({ id, label, error, className = '', ...input }) {
  return (
    <div className={`flex flex-col gap-[5px] ${className}`}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <textarea id={id} rows={3} className={`${fieldBase} ${fieldBorder(error)} min-h-[84px] px-3.5 py-3 leading-5 resize-y`} aria-invalid={!!error} {...input} />
      <FieldError>{error}</FieldError>
    </div>
  )
}

/** Native <select> styled like the Figma field (chevron on the right). */
export function SelectField({ id, label, error, placeholder, options, value, onChange, className = '' }) {
  return (
    <div className={`flex flex-col gap-[5px] ${className}`}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className={`${fieldBase} ${fieldBorder(error)} h-[42px] pl-3.5 pr-10 appearance-none cursor-pointer ${value ? '' : 'text-black/80'}`}>
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((o) => {
            const opt = typeof o === 'string' ? { value: o, label: o } : o
            return <option key={opt.value} value={opt.value}>{opt.label}</option>
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/50" strokeWidth={2} aria-hidden />
      </div>
      <FieldError>{error}</FieldError>
    </div>
  )
}

/** Multi-select pill group (platforms / niches / partnership types). */
export function ChipGroup({ label, hint, options, value, onToggle, color, error }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div className="flex flex-wrap gap-2 pt-1">
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o
          const on = value.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(opt.value)}
              style={on ? { backgroundColor: color, borderColor: color } : undefined}
              className={`h-8 px-3 rounded-full border text-[12px] leading-[18px] font-medium transition ${
                on ? 'text-white' : 'bg-black/[0.04] border-black/[0.12] text-black/80 hover:border-black/30'
              }`}>
              {opt.label}
            </button>
          )
        })}
      </div>
      <FieldError>{error}</FieldError>
    </div>
  )
}

/** Two-option segmented control (Brand / Agency). */
export function SegmentedChoice({ label, options, value, onChange, color }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <FieldLabel>{label}</FieldLabel>
      <div className="grid grid-cols-2 gap-3">
        {options.map((o) => {
          const on = value === o.value
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o.value)}
              style={on ? { backgroundColor: color, borderColor: color } : undefined}
              className={`h-[42px] rounded-[10px] border text-[13px] font-semibold transition ${
                on ? 'text-white' : 'bg-black/[0.04] border-black/[0.12] text-black/80 hover:border-black/30'
              }`}>
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function PrimaryButton({ loading, loadingLabel, children, ...rest }) {
  return (
    <div className="pt-2">
      <button
        type="submit"
        disabled={loading}
        className="w-full h-[46px] rounded-[11px] bg-cta hover:bg-black text-white text-[13px] font-bold tracking-[0.03em] transition disabled:opacity-70 inline-flex items-center justify-center gap-2"
        {...rest}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} aria-hidden />{loadingLabel}</> : children}
      </button>
    </div>
  )
}

/** Red banner for API errors (email taken, network, …). */
export function FormAlert({ children }) {
  if (!children) return null
  return (
    <div role="alert" className="px-3.5 py-2.5 rounded-[10px] border border-red-200 bg-red-50 text-[12.5px] leading-5 font-semibold text-red-700">
      {children}
    </div>
  )
}

/** Brand wizard progress: ● Account —— ② Company —— ③ Partnerships */
export function StepIndicator({ steps, current, color }) {
  return (
    <ol className="flex items-center justify-center gap-3 pt-8" aria-label="Progress">
      {steps.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <li key={label} className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  done ? 'bg-black text-white' : active ? 'text-white' : 'bg-black/[0.08] text-black/40'
                }`}
                style={active ? { backgroundColor: color } : undefined}
                aria-current={active ? 'step' : undefined}>
                {done ? <Check className="w-3 h-3" strokeWidth={3} aria-hidden /> : n}
              </span>
              <span className={`text-[12px] font-semibold ${active ? 'text-black' : 'text-black/40'}`}>{label}</span>
            </span>
            {n < steps.length ? <span className={`hidden sm:block w-8 h-px ${done ? 'bg-black' : 'bg-black/[0.12]'}`} aria-hidden /> : null}
          </li>
        )
      })}
    </ol>
  )
}
