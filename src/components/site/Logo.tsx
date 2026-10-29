import { Link } from 'react-router-dom'
import { cx } from '../../lib/format'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cx('h-7 w-7', className)} aria-hidden>
      <rect width="32" height="32" rx="6" fill="#1f4d3a" />
      <path d="M9 8h9.5a5.5 5.5 0 0 1 0 11H13v5H9z" fill="none" stroke="#f6f3ea" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M13 12.5h5.3" stroke="#c9a77c" strokeWidth="2" />
    </svg>
  )
}

export function Logo({ to = '/', inverse = false }: { to?: string; inverse?: boolean }) {
  return (
    <Link to={to} className="flex items-center gap-2" aria-label="Paperhaven home">
      <LogoMark />
      <span className={cx('text-[17px] font-semibold tracking-tight', inverse ? 'text-paper' : 'text-ink')}>Paperhaven</span>
    </Link>
  )
}
