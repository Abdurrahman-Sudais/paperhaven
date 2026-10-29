import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cx } from '../../lib/format'

export const inputClass =
  'block w-full rounded-md border border-line-strong bg-white px-3 py-2 text-sm text-ink placeholder:text-fibre focus:border-forest-2 focus:outline-none focus:ring-2 focus:ring-forest-2/20 disabled:bg-paper-2'

interface WrapProps {
  label: ReactNode
  hint?: ReactNode
  error?: string
  required?: boolean
  adornment?: ReactNode
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode
  className?: string
}

function FieldWrap({ label, hint, error, required, adornment, children, className }: WrapProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errId = `${id}-err`
  const describedBy = [hint ? hintId : '', error ? errId : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-graphite">
          {label}
          {required && <span className="ml-0.5 text-rust" aria-hidden>*</span>}
        </label>
        {adornment}
      </div>
      {children({ id, describedBy, invalid: !!error })}
      {hint && !error && <p id={hintId} className="mt-1 text-xs text-slate">{hint}</p>}
      {error && <p id={errId} role="alert" className="mt-1 text-xs font-medium text-rust">{error}</p>}
    </div>
  )
}

type Common = { label: ReactNode; hint?: ReactNode; error?: string; adornment?: ReactNode; wrapClassName?: string }

export function TextField({ label, hint, error, adornment, wrapClassName, className, required, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldWrap label={label} hint={hint} error={error} required={required} adornment={adornment} className={wrapClassName}>
      {({ id, describedBy, invalid }) => (
        <input id={id} aria-describedby={describedBy} aria-invalid={invalid} required={required}
          className={cx(inputClass, invalid && 'border-rust focus:border-rust focus:ring-rust/20', className)} {...rest} />
      )}
    </FieldWrap>
  )
}

export function SelectField({ label, hint, error, adornment, wrapClassName, className, required, children, ...rest }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldWrap label={label} hint={hint} error={error} required={required} adornment={adornment} className={wrapClassName}>
      {({ id, describedBy, invalid }) => (
        <select id={id} aria-describedby={describedBy} aria-invalid={invalid} required={required}
          className={cx(inputClass, 'pr-8', invalid && 'border-rust', className)} {...rest}>
          {children}
        </select>
      )}
    </FieldWrap>
  )
}

export function TextAreaField({ label, hint, error, adornment, wrapClassName, className, required, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldWrap label={label} hint={hint} error={error} required={required} adornment={adornment} className={wrapClassName}>
      {({ id, describedBy, invalid }) => (
        <textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} required={required}
          className={cx(inputClass, 'min-h-20', invalid && 'border-rust', className)} {...rest} />
      )}
    </FieldWrap>
  )
}
