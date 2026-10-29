import { useState, type FormEvent } from 'react'
import { CheckCircle2, Mail, MapPin } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { SelectField, TextAreaField, TextField } from '../components/ui/Field'
import { PageHero, Section } from '../components/site/Section'
import { usePageMeta } from '../lib/usePageMeta'

interface ContactForm {
  name: string
  email: string
  company: string
  role: string
  message: string
}

type Errors = Partial<Record<keyof ContactForm, string>>

export function validateContact(f: ContactForm): Errors {
  const e: Errors = {}
  if (!f.name.trim()) e.name = 'Please enter your name.'
  if (!f.email.trim()) e.email = 'Please enter your work email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Enter a valid email address.'
  if (!f.company.trim()) e.company = 'Please enter your company.'
  if (!f.role) e.role = 'Select the option that best describes your organisation.'
  if (f.message.trim().length < 10) e.message = 'Tell us a little more (at least 10 characters).'
  return e
}

const EMPTY: ContactForm = { name: '', email: '', company: '', role: '', message: '' }

export function ContactPage() {
  usePageMeta('Contact', 'Contact Paperhaven about recovered-paper assessment and blend planning. Email ifeoma@paperhaven.top.', '/contact')
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)

  const set = (k: keyof ContactForm) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs = validateContact(form)
    setErrors(errs)
    if (Object.keys(errs).length === 0) setSent(true)
  }

  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to us about your yard, mill or supply.">
        <p>Tell us how your team assesses and plans recovered paper today. We’ll reply from ifeoma@paperhaven.top.</p>
      </PageHero>
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Card className="p-6">
            {sent ? (
              <div className="py-10 text-center" role="status">
                <CheckCircle2 className="mx-auto text-forest" size={36} />
                <h2 className="mt-4 text-xl font-semibold text-ink">Thank you, {form.name.split(' ')[0]}.</h2>
                <p className="mx-auto mt-2 max-w-md text-slate">
                  This demonstration site has no backend, so your message was validated but not sent. Please email{' '}
                  <a className="font-medium text-forest underline" href="mailto:ifeoma@paperhaven.top">ifeoma@paperhaven.top</a> directly.
                </p>
                <Button variant="secondary" className="mt-6" onClick={() => { setForm(EMPTY); setSent(false) }}>Start again</Button>
              </div>
            ) : (
              <form noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <TextField label="Name" required autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
                <TextField label="Work email" required type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
                <TextField label="Company" required autoComplete="organization" value={form.company} onChange={set('company')} error={errors.company} />
                <SelectField label="Organisation type" required value={form.role} onChange={set('role')} error={errors.role}>
                  <option value="">Select…</option>
                  <option>Paper mill</option>
                  <option>Recycling processor</option>
                  <option>Recovered-fibre supplier or trader</option>
                  <option>Other</option>
                </SelectField>
                <TextAreaField wrapClassName="sm:col-span-2" label="How can we help?" required rows={5} value={form.message} onChange={set('message')} error={errors.message} />
                <div className="flex items-center justify-between gap-4 sm:col-span-2">
                  <p className="text-xs text-slate">Demo form — no data leaves your browser.</p>
                  <Button type="submit">Send message</Button>
                </div>
              </form>
            )}
          </Card>
          <div className="space-y-6">
            <div className="flex gap-3">
              <Mail className="mt-0.5 text-forest" size={18} />
              <div>
                <p className="font-semibold text-ink">Email</p>
                <a href="mailto:ifeoma@paperhaven.top" className="text-forest hover:underline">ifeoma@paperhaven.top</a>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="mt-0.5 text-forest" size={18} />
              <div>
                <p className="font-semibold text-ink">Web</p>
                <p className="text-slate">paperhaven.top</p>
              </div>
            </div>
            <div className="rounded-lg border border-line bg-paper-2 p-5 text-sm text-slate">
              <p className="font-semibold text-ink">Founder</p>
              <p className="mt-1">Ifeoma Ezeani</p>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
