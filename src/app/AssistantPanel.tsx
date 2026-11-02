import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bot, Info, MessageSquare } from 'lucide-react'
import { EXAMPLE_QUESTIONS, answer, type AssistantAnswer } from '../lib/assistant'
import { usePlanner } from '../state/PlannerContext'
import { cx } from '../lib/format'

/** “Ask about this yard” — answers from the demo records and lists the records it used. */
export function AssistantPanel() {
  const { batches, scenarios, specification } = usePlanner()
  const [q, setQ] = useState('')
  const [asked, setAsked] = useState<{ q: string; a: AssistantAnswer } | null>(null)
  const ask = (question: string) => {
    if (!question.trim()) return
    setAsked({ q: question.trim(), a: answer(question, { batches, scenarios, specification }) })
    setQ('')
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    ask(q)
  }
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white" aria-labelledby="assistant-title">
      <header className="flex items-center gap-2 border-b border-line bg-ink px-4 py-3 text-paper">
        <Bot size={16} className="text-kraft-soft" aria-hidden />
        <h2 id="assistant-title" className="text-sm font-semibold">Ask about this yard</h2>
        <span className="rounded border border-paper/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-paper/60">Simulated assistant</span>
      </header>
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((e) => (
            <button key={e} type="button" onClick={() => ask(e)} className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs text-graphite hover:border-forest hover:text-forest">{e}</button>
          ))}
        </div>
        <form onSubmit={submit} className="flex gap-2">
          <label htmlFor="assistant-q" className="sr-only">Ask a question about the demo yard</label>
          <input id="assistant-q" className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm focus:border-forest focus:outline-none" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Tell me about DEMO-B104" maxLength={200} />
          <button type="submit" className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-forest px-3 py-2 text-sm font-medium text-paper hover:bg-forest-2"><MessageSquare size={14} aria-hidden /> Ask</button>
        </form>
        {asked && (
          <div className={cx('rounded-lg border p-4', asked.a.kind === 'refusal' ? 'border-ochre/30 bg-ochre-soft' : 'border-line bg-paper')} aria-live="polite">
            <p className="text-[11px] text-slate">“{asked.q}”</p>
            <h3 className="mt-1 font-semibold">{asked.a.title}</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-graphite">{asked.a.lines.map((l) => <li key={l}>{l}</li>)}</ul>
            {asked.a.sources.length > 0 && <p className="mt-3 font-mono text-[11px] text-slate">From {asked.a.sources.length} record{asked.a.sources.length > 1 ? 's' : ''}: {asked.a.sources.join(', ')}</p>}
            {asked.a.links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">{asked.a.links.map((l) => <Link key={l.to} to={l.to} className="inline-flex items-center gap-1 text-xs font-medium text-forest hover:underline">{l.label} <ArrowRight size={12} aria-hidden /></Link>)}</div>
            )}
          </div>
        )}
        <p className="flex items-start gap-1.5 text-[11px] text-slate"><Info size={13} className="mt-0.5 shrink-0" aria-hidden /> Answers are computed from this demo’s records and list the records used. No language model is called. It never predicts sheet quality or fills in missing measurements.</p>
      </div>
    </section>
  )
}
