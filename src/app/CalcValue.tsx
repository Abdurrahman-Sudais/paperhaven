import { AlertTriangle, ChevronDown } from 'lucide-react'
import type { CalcResult } from '../lib/calculations'
import { ProvenanceTag } from '../components/ui/Provenance'
import { fmtUsd, fmtUsd2 } from '../lib/format'
import { cx } from '../lib/format'

export function formatCalc(r: CalcResult, decimals = 2): string {
  if (r.status !== 'ok') return 'Unavailable'
  return formatValue(r.value, r.unit, decimals)
}

export function formatValue(v: number, unit: string, decimals = 2): string {
  if (unit === 'USD') return fmtUsd(v)
  if (unit === 'USD/t') return `${fmtUsd2(v)}/t`
  if (unit === '%') return `${v.toFixed(decimals)}%`
  if (unit === 't') return `${v.toLocaleString('en-US', { maximumFractionDigits: 2 })} t`
  return `${v} ${unit}`
}

/** A calculated result card with an expandable trace of its formula and inputs. */
export function CalcValue({ label, result, decimals = 2 }: { label: string; result: CalcResult; decimals?: number }) {
  const ok = result.status === 'ok'
  return (
    <div className={cx('rounded-lg border p-4', ok ? 'border-line bg-white/80' : 'border-ochre/35 bg-ochre-soft/70')}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate">{label}</span>
        <ProvenanceTag kind="calculated" />
      </div>
      {ok ? (
        <div className="mt-2 text-2xl font-semibold tabular text-ink">{formatValue(result.value, result.unit, decimals)}</div>
      ) : (
        <div className="mt-2">
          <div className="flex items-center gap-1.5 text-base font-semibold text-ochre" role="status">
            <AlertTriangle size={16} aria-hidden /> Cannot be calculated
          </div>
          <p className="mt-1 text-xs leading-snug text-graphite">{result.reason}</p>
          {result.missing.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs font-medium text-ochre">
              {result.missing.map((m, i) => <li key={i}>• {m.message}</li>)}
            </ul>
          )}
        </div>
      )}
      <details className="group mt-3 border-t border-line/70 pt-2 text-xs">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-slate hover:text-ink">
          <ChevronDown size={12} className="transition-transform group-open:rotate-180" /> How this is calculated
        </summary>
        <p className="mt-2 font-mono text-[11px] text-graphite">{result.formula}</p>
        {ok && result.inputs.length > 0 && (
          <table className="mt-2 w-full tabular">
            <tbody>
              {result.inputs.map((i, k) => (
                <tr key={k} className="border-t border-line/50">
                  <td className="py-1 pr-2 text-graphite">{i.label}{i.weightPct !== undefined && <span className="text-slate"> · {i.weightPct}%</span>}</td>
                  <td className="py-1 pr-2 text-right">{formatValue(i.value, i.unit)}</td>
                  <td className="py-1 text-right"><ProvenanceTag kind={i.provenance} compact /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </details>
    </div>
  )
}
