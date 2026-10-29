'use client'
// Brand / company signup — 3 steps (Figma "StreamLink | Landing Login" →
// Aprovado → Brand & Company Step 1–3, Oct 2026).
//   1 Account      → creates the user (role company | agency)
//   2 Company      → collected locally
//   3 Partnerships → creates the company page, then /companies
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi, companyApi, profileApi } from '@/lib/api-client'
import { useAuthStore } from '@/lib/store'
import {
  BUDGET_RANGES, COMPANY_SIZES, EMAIL_RE, INDUSTRIES, PARTNERSHIP_TYPES, generateHandle,
} from '@/lib/signup'
import {
  ChipGroup, Eyebrow, FormAlert, FormTitle, PrimaryButton, ROLE_COLORS,
  SegmentedChoice, SelectField, SignupShell, StepIndicator, TextArea, TextField,
} from '@/components/auth/AuthUI'

const STEPS = ['Account', 'Company', 'Partnerships']
const COLOR = ROLE_COLORS.brand

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'company'
}

// The API validates website as a full URL; accept "acme.com" too.
function normalizeUrl(raw) {
  const v = raw.trim()
  if (!v) return null
  return /^https?:\/\//i.test(v) ? v : `https://${v}`
}

export default function RegisterCompanyPage() {
  const router = useRouter()
  const acceptSession = useAuthStore((s) => s.acceptSession)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState('')
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    // Step 1
    accountType: 'brand', firstName: '', lastName: '', email: '', password: '',
    // Step 2
    companyName: '', website: '', industry: '', companySize: '', description: '',
    // Step 3
    lookingFor: [], budgetRange: '', partnershipNotes: '',
  })

  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e))
    setAlert('')
  }
  const onInput = (k) => (e) => set(k)(e.target.value)
  const togglePartner = (v) =>
    set('lookingFor')(form.lookingFor.includes(v) ? form.lookingFor.filter((x) => x !== v) : [...form.lookingFor, v])

  function fail(fieldErrors, message) {
    setErrors(fieldErrors)
    setAlert(message)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // STEP 1 — create the account
  async function handleStep1(e) {
    e.preventDefault()
    const v = {}
    if (!form.firstName.trim()) v.firstName = 'First name is required'
    if (!form.lastName.trim()) v.lastName = 'Last name is required'
    if (!form.email.trim()) v.email = 'Work email is required'
    else if (!EMAIL_RE.test(form.email.trim())) v.email = 'Enter a valid email address'
    if (!form.password) v.password = 'Password is required'
    else if (form.password.length < 8) v.password = 'Password must be at least 8 characters'
    if (Object.keys(v).length) return fail(v, 'Please fix the highlighted fields.')

    setLoading(true)
    setAlert('')
    const isAgency = form.accountType === 'agency'
    try {
      let result
      for (let attempt = 0; ; attempt++) {
        try {
          result = await authApi.signup({
            email: form.email.trim(),
            password: form.password,
            displayName: `${form.firstName.trim()} ${form.lastName.trim()}`.slice(0, 80),
            handle: generateHandle(form.firstName, form.lastName, form.email),
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            language: 'en',
            role: isAgency ? 'agency' : 'company',
          })
          break
        } catch (err) {
          if (err.code !== 'HANDLE_TAKEN' || attempt >= 2) throw err
        }
      }
      await acceptSession(result)
      setStep(2)
      window.scrollTo({ top: 0 })
    } catch (err) {
      if (err.code === 'EMAIL_TAKEN') fail({ email: 'This email is already registered' }, 'This email is already registered. Try signing in instead.')
      else if (err.code === 'VALIDATION_ERROR') fail({}, 'Please check your details and try again.')
      else fail({}, err.message || 'Could not create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // STEP 2 — company details (validated locally)
  function handleStep2(e) {
    e.preventDefault()
    const v = {}
    if (!form.companyName.trim()) v.companyName = 'Company name is required'
    if (!form.industry) v.industry = 'Please select your industry'
    const url = normalizeUrl(form.website)
    if (url) {
      try { new URL(url) } catch { v.website = 'Enter a valid website, e.g. https://acmecorp.com' }
    }
    if (Object.keys(v).length) return fail(v, 'Please fix the highlighted fields.')
    setAlert('')
    setStep(3)
    window.scrollTo({ top: 0 })
  }

  // STEP 3 — create the company page
  async function handleStep3(e) {
    e.preventDefault()
    setLoading(true)
    setAlert('')
    try {
      await companyApi.create({
        name: form.companyName.trim(),
        slug: slugify(form.companyName),
        industry: form.industry || null,
        website: normalizeUrl(form.website),
        description: form.description.trim() || null,
        companySize: form.companySize || null,
        lookingFor: form.lookingFor,
        budgetRange: form.budgetRange || null,
        partnershipNotes: form.partnershipNotes.trim() || null,
      })
      // Present the account as the brand across the app.
      try {
        await profileApi.updateMe({
          displayName: form.companyName.trim(),
          bio: form.description.trim() || null,
          category: 'Brand / Company',
          website: normalizeUrl(form.website),
        })
      } catch { /* non-fatal */ }
      router.replace('/companies')
    } catch (err) {
      if (err.code === 'SLUG_TAKEN') {
        setStep(2)
        fail({ companyName: 'A company with this name already exists' }, 'A company with that name already exists. Try a different one.')
      } else {
        fail({}, err.message || 'Something went wrong. Please try again.')
      }
      setLoading(false)
    }
  }

  // Back: step 1 → account types; step 3 → step 2. Step 2 has no back —
  // the account already exists after step 1.
  const shellBack = step === 1 ? { backHref: '/register' } : step === 3 ? { onBack: () => { setAlert(''); setStep(2) } } : {}

  return (
    <SignupShell {...shellBack}>
      <Eyebrow color={COLOR}>Brand / Company</Eyebrow>

      {step === 1 ? (
        <>
          <FormTitle title="Create your account" subtitle="Choose your account type and set up your credentials." />
          <form onSubmit={handleStep1} noValidate className="flex flex-col gap-5 pt-10">
            <FormAlert>{alert}</FormAlert>
            <SegmentedChoice
              label="Account type"
              value={form.accountType}
              onChange={set('accountType')}
              color={COLOR}
              options={[{ value: 'brand', label: 'Brand' }, { value: 'agency', label: 'Agency' }]}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
              <TextField id="firstName" label="First name" placeholder="Taylor" value={form.firstName} onChange={onInput('firstName')} error={errors.firstName} autoComplete="given-name" maxLength={80} />
              <TextField id="lastName" label="Last name" placeholder="Chen" value={form.lastName} onChange={onInput('lastName')} error={errors.lastName} autoComplete="family-name" maxLength={80} />
            </div>
            <TextField id="email" type="email" label="Work email" placeholder="taylor@company.com" value={form.email} onChange={onInput('email')} error={errors.email} autoComplete="email" autoCapitalize="none" />
            <TextField id="password" type="password" label="Password" placeholder="At least 8 characters" value={form.password} onChange={onInput('password')} error={errors.password} autoComplete="new-password" />
            <PrimaryButton loading={loading} loadingLabel="Creating account…">Continue</PrimaryButton>
          </form>
        </>
      ) : step === 2 ? (
        <>
          <FormTitle title="About your company" subtitle="Tell creators about your brand." />
          <form onSubmit={handleStep2} noValidate className="flex flex-col gap-5 pt-10">
            <FormAlert>{alert}</FormAlert>
            <TextField id="companyName" label="Company name" placeholder="Acme Corp" value={form.companyName} onChange={onInput('companyName')} error={errors.companyName} maxLength={120} />
            <TextField id="website" type="url" label="Website" placeholder="https://acmecorp.com" value={form.website} onChange={onInput('website')} error={errors.website} autoCapitalize="none" />
            <SelectField id="industry" label="Industry" placeholder="Select your industry" value={form.industry} onChange={set('industry')} options={INDUSTRIES} error={errors.industry} />
            <SelectField id="companySize" label="Company size" placeholder="Select size" value={form.companySize} onChange={set('companySize')} options={COMPANY_SIZES.map((s) => ({ value: s, label: `${s} employees` }))} />
            <TextArea id="description" label="About your brand" placeholder="Describe your brand, target audience, and values…" value={form.description} onChange={onInput('description')} maxLength={1000} />
            <PrimaryButton>Continue</PrimaryButton>
          </form>
        </>
      ) : (
        <>
          <FormTitle title="Partnership goals" subtitle="What kind of collaborations are you looking for?" />
          <form onSubmit={handleStep3} noValidate className="flex flex-col gap-5 pt-10">
            <FormAlert>{alert}</FormAlert>
            <ChipGroup label="Partnership types" hint="Select all that apply" options={PARTNERSHIP_TYPES} value={form.lookingFor} onToggle={togglePartner} color={COLOR} />
            <SelectField id="budgetRange" label="Campaign budget" placeholder="Select a typical range" value={form.budgetRange} onChange={set('budgetRange')} options={BUDGET_RANGES} />
            <TextArea id="partnershipNotes" label="What are you looking for?" placeholder="Describe the type of creators and campaigns you have in mind…" value={form.partnershipNotes} onChange={onInput('partnershipNotes')} maxLength={1000} />
            <PrimaryButton loading={loading} loadingLabel="Finishing setup…">Complete setup</PrimaryButton>
          </form>
        </>
      )}

      <StepIndicator steps={STEPS} current={step} color={COLOR} />

      {step === 1 ? (
        <p className="pt-6 text-center text-[13px] text-black/50">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-black hover:underline">Sign in</Link>
        </p>
      ) : null}
    </SignupShell>
  )
}
