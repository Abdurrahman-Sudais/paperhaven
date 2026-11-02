import type { ReactNode } from 'react'

/** Explains why controls are read-only for the acting demo user. */
export function RoleNote({ children }: { children: ReactNode }) {
  return (
    <p role="note" className="flex items-start gap-1.5 rounded-md border border-line bg-paper-2 px-3 py-2 text-xs text-slate">
      <span aria-hidden>🔒</span>
      <span>{children}</span>
    </p>
  )
}
