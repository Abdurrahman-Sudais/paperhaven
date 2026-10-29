const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const fmtUsd = (n: number) => usd0.format(n)
export const fmtUsd2 = (n: number) => usd2.format(n)
export const fmtTonnes = (n: number, d = 1) => `${n.toLocaleString('en-US', { maximumFractionDigits: d })} t`
export const fmtPct = (n: number, d = 1) => `${n.toFixed(d)}%`
export const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return '—'
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')
