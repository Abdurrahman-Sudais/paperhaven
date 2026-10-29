import { useId } from 'react'
import { cx } from '../../lib/format'

/**
 * Restrained, documentary-style material plates rendered as SVG so the site
 * ships without third-party photography. Swap for licensed photography of
 * your own yards and mills when available (see README).
 */
type Scene = 'bales' | 'warehouse' | 'mill' | 'inspection'

const KRAFT = ['#b48a5e', '#a77d52', '#c29a6d', '#9c7550', '#b9926a', '#8f6c49']
const GREY = ['#a9a69c', '#b7b3a6', '#9c998f', '#c2bdaf', '#8f8c83']

function rand(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function Bale({ x, y, w, h, fill, filter, straps = 2 }: { x: number; y: number; w: number; h: number; fill: string; filter: string; straps?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={fill} />
      <rect x={x} y={y} width={w} height={h} fill="#000" opacity={0.12} filter={`url(#${filter})`} />
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1={x + 4} x2={x + w - 4} y1={y + ((i + 1) * h) / 6} y2={y + ((i + 1) * h) / 6 + (i % 2 ? 1.5 : -1)} stroke="#000" strokeOpacity={0.08} />
      ))}
      {Array.from({ length: straps }, (_, i) => {
        const sx = x + ((i + 1) * w) / (straps + 1)
        return <line key={i} x1={sx} x2={sx} y1={y} y2={y + h} stroke="#2a2a26" strokeOpacity={0.55} strokeWidth={1.6} />
      })}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#000" strokeOpacity={0.18} />
    </g>
  )
}

export function MaterialScene({ scene, caption, className }: { scene: Scene; caption?: string; className?: string }) {
  const uid = useId().replace(/:/g, '')
  const noise = `n-${uid}`
  const shade = `s-${uid}`
  const r = rand(scene.length * 97 + 13)

  return (
    <figure className={cx('relative overflow-hidden rounded-lg border border-ink/10 bg-graphite', className)}>
      <svg viewBox="0 0 640 400" className="block h-full w-full" role="img" aria-label={caption ?? `${scene} scene`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={noise}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed={scene.length} />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.25" />
          </filter>
          <linearGradient id={shade} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1b1f1d" stopOpacity="0.0" />
            <stop offset="1" stopColor="#1b1f1d" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {scene === 'bales' && (
          <g>
            <rect width="640" height="400" fill="#4a4f4b" />
            <rect y="300" width="640" height="100" fill="#3a3e3b" />
            {[0, 1, 2].map((row) =>
              Array.from({ length: 6 }, (_, col) => (
                <Bale key={`${row}-${col}`} x={18 + col * 104 + (row % 2) * 10} y={210 - row * 86} w={96} h={82}
                  fill={KRAFT[Math.floor(r() * KRAFT.length)]} filter={noise} />
              )),
            )}
          </g>
        )}

        {scene === 'warehouse' && (
          <g>
            <rect width="640" height="400" fill="#3f4441" />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1={i * 58} x2={i * 58} y1={0} y2={60} stroke="#f6f3ea" strokeOpacity={0.05} />
            ))}
            <rect y="330" width="640" height="70" fill="#323633" />
            <line x1="0" x2="640" y1="365" y2="365" stroke="#d6b14a" strokeOpacity={0.55} strokeWidth={3} strokeDasharray="28 18" />
            {[0, 1, 2, 3].map((bay) => (
              <g key={bay}>
                <rect x={24 + bay * 154} y={70} width={6} height={262} fill="#2f5a7a" />
                <rect x={168 + bay * 154} y={70} width={6} height={262} fill="#2f5a7a" />
                {[150, 240].map((by) => (
                  <rect key={by} x={24 + bay * 154} y={by} width={150} height={5} fill="#c0662e" />
                ))}
                {[78, 158, 248].map((by, k) => (
                  <g key={k}>
                    <Bale x={34 + bay * 154} y={by} w={62} h={k === 2 ? 82 : 70} fill={(k + bay) % 3 === 0 ? GREY[(bay + k) % GREY.length] : KRAFT[(bay * 2 + k) % KRAFT.length]} filter={noise} straps={1} />
                    <Bale x={102 + bay * 154} y={by} w={62} h={k === 2 ? 82 : 70} fill={KRAFT[(bay + k * 3) % KRAFT.length]} filter={noise} straps={1} />
                  </g>
                ))}
              </g>
            ))}
          </g>
        )}

        {scene === 'mill' && (
          <g>
            <rect width="640" height="400" fill="#454a46" />
            <rect y="310" width="640" height="90" fill="#363a37" />
            {[
              [150, 220, 92],
              [330, 236, 76],
              [490, 240, 70],
            ].map(([cx_, cy, rad]) => (
              <g key={cx_}>
                <circle cx={cx_} cy={cy} r={rad} fill="#ebe5d6" />
                <circle cx={cx_} cy={cy} r={rad} fill="#000" opacity={0.1} filter={`url(#${noise})`} />
                {Array.from({ length: 9 }, (_, k) => (
                  <circle key={k} cx={cx_} cy={cy} r={rad - k * (rad / 10)} fill="none" stroke="#8b8475" strokeOpacity={0.25} />
                ))}
                <circle cx={cx_} cy={cy} r={rad * 0.14} fill="#8a6640" />
                <circle cx={cx_} cy={cy} r={rad * 0.07} fill="#2a2a26" />
              </g>
            ))}
            <line x1="0" x2="640" y1="312" y2="312" stroke="#f6f3ea" strokeOpacity={0.12} />
          </g>
        )}

        {scene === 'inspection' && (
          <g>
            <rect width="640" height="400" fill="#4a4f4b" />
            <rect x="0" y="292" width="640" height="108" fill="#3b3f3c" />
            <Bale x={70} y={110} w={260} h={190} fill={KRAFT[1]} filter={noise} straps={3} />
            {/* opened face showing layered sheets */}
            {Array.from({ length: 16 }, (_, i) => (
              <path key={i} d={`M352 ${118 + i * 11} q 60 ${i % 2 ? 4 : -4} 120 0 t 110 ${i % 3 ? 2 : -3}`} stroke={i % 4 === 0 ? '#d9d4c5' : KRAFT[i % KRAFT.length]} strokeWidth={8} fill="none" opacity={0.9} />
            ))}
            {/* sampling bracket annotation */}
            <g stroke="#f6f3ea" strokeOpacity={0.85} fill="none">
              <path d="M352 104 v-14 h232 v14" />
              <path d="M600 118 h14 v172 h-14" />
            </g>
            <text x="468" y="82" textAnchor="middle" fill="#f6f3ea" fontFamily="IBM Plex Mono, monospace" fontSize="12" opacity={0.85}>SAMPLE FACE</text>
            <text x="626" y="210" fill="#f6f3ea" fontFamily="IBM Plex Mono, monospace" fontSize="11" opacity={0.7} transform="rotate(90 626 210)" textAnchor="middle">25 KG</text>
          </g>
        )}

        <rect width="640" height="400" fill={`url(#${shade})`} />
      </svg>
      {caption && (
        <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-paper/85">
          <span>{caption}</span>
          <span className="text-paper/50">Illustrative plate</span>
        </figcaption>
      )}
    </figure>
  )
}
