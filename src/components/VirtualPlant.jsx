import { useEffect, useRef } from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import GlassCard from './GlassCard.jsx'
import { levelUpHaptic, tapHaptic } from '../lib/haptics.js'

const LEAVES = [
  { y: 86, rot: 26, scale: 0.72 },
  { y: 76, rot: -24, scale: 0.82 },
  { y: 66, rot: 30, scale: 0.92 },
  { y: 56, rot: -28, scale: 1 },
  { y: 46, rot: 24, scale: 1.06 },
]

const MAX_LEVEL = 5
const DROOP = 46

export default function VirtualPlant({ tone, plant, hero = false }) {
  const { level, drooping, stage, health } = plant
  const wiggle = useAnimationControls()
  const pop = useAnimationControls()
  const reduced = useReducedMotion()
  const prevLevel = useRef(level)

  useEffect(() => {
    if (level > prevLevel.current) {
      levelUpHaptic()
      if (!reduced) {
        pop.start({ scale: [1, 1.14, 0.97, 1], transition: { duration: 0.65, ease: 'easeOut' } })
      }
    }
    prevLevel.current = level
  }, [level, pop, reduced])

  const playWiggle = () => {
    tapHaptic()
    if (reduced) return
    wiggle.start({
      rotate: [0, -7, 6, -4, 2, 0],
      transition: { duration: 0.55, ease: 'easeInOut' },
    })
  }

  const grown = LEAVES.slice(0, Math.max(0, Math.min(MAX_LEVEL, level)))
  const stemTop = grown.length ? grown[grown.length - 1].y - 8 : 92
  // The tip must land on the leaf axis (x=60) or the topmost leaf detaches.
  const stemPath = drooping
    ? `M60 100 C 69 93, 67 ${stemTop + 12}, 61 ${stemTop + 1}`
    : `M60 100 C 58 ${stemTop + 14}, 62 ${stemTop + 6}, 60 ${stemTop}`

  return (
    <GlassCard tone={tone} className={hero ? 'p-6' : 'p-5'}>
      {hero ? null : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className={`font-display text-lg font-bold ${tone.ink}`}>Her plant</h2>
            <p className={`text-sm font-medium ${tone.muted}`}>{stage}</p>
          </div>
          <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${tone.chip}`}>
            Leafy level {level}
          </span>
        </div>
      )}

      <div className="mt-2 flex justify-center">
        <motion.div
          animate={wiggle}
          onClick={playWiggle}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              playWiggle()
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Wiggle the plant"
          className="cursor-pointer select-none rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-droplet-400"
          whileTap={{ scale: 0.95 }}
        >
          <motion.div animate={pop} initial={false}>
            <motion.div
              initial={false}
              animate={{
                scale: (0.86 + level * 0.05) * (hero ? 1.18 : 1),
                filter: `saturate(${(0.5 + health * 0.85).toFixed(2)})`,
              }}
              transition={{ type: 'spring', stiffness: 120, damping: 15 }}
            >
              <svg viewBox="0 0 120 140" className={`w-auto ${hero ? 'h-64' : 'h-44'}`} role="img" aria-label={`Plant level ${level}${drooping ? ', drooping' : ''}`}>
                <defs>
                  <linearGradient id="pot-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={tone.plant.pot} />
                    <stop offset="1" stopColor={tone.plant.leafDark} stopOpacity="0.55" />
                  </linearGradient>
                  <radialGradient id="plant-halo" cx="0.5" cy="0.35" r="0.5">
                    <stop offset="0" stopColor={tone.plant.glow} stopOpacity="0.6" />
                    <stop offset="1" stopColor={tone.plant.glow} stopOpacity="0" />
                  </radialGradient>
                </defs>

                <motion.circle
                  cx="60"
                  cy="55"
                  r="46"
                  fill="url(#plant-halo)"
                  initial={false}
                  animate={{ opacity: 0.5 + health * 0.6, scale: 0.9 + health * 0.25 }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                />

                <motion.path
                  d={stemPath}
                  stroke={tone.plant.leafDark}
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  initial={false}
                  animate={{ d: stemPath }}
                  transition={{ type: 'spring', stiffness: 110, damping: 16 }}
                />

                {grown.map((leaf, i) => {
                  const left = i % 2 === 0
                  return (
                    <g key={i} transform={`translate(60 ${leaf.y})`}>
                      <motion.g
                        style={{ originX: left ? 1 : 0, originY: 0.5 }}
                        initial={{ scale: 0.2, opacity: 0, rotate: leaf.rot }}
                        animate={{
                          scale: leaf.scale,
                          opacity: 1,
                          rotate: leaf.rot + (drooping ? (left ? -DROOP : DROOP) : 0),
                        }}
                        transition={{ type: 'spring', stiffness: 200, damping: 13, delay: i * 0.05 }}
                      >
                        <ellipse cx={left ? -15 : 15} cy="0" rx="15" ry="7.5" fill={tone.plant.leaf} />
                        <path
                          d={left ? 'M0 0 L-26 0' : 'M0 0 L26 0'}
                          stroke={tone.plant.leafDark}
                          strokeWidth="1"
                          opacity="0.5"
                        />
                      </motion.g>
                    </g>
                  )
                })}

                {level >= MAX_LEVEL ? (
                  <motion.circle
                    cx="60"
                    cy={stemTop - 8}
                    r="5.5"
                    fill={tone.plant.pot}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.25 }}
                  />
                ) : null}

                <path d="M36 100 L84 100 L79 130 L41 130 Z" fill="url(#pot-gradient)" />
                <rect x="32" y="95" width="56" height="8" rx="4" fill={tone.plant.pot} />
                <rect x="32" y="95" width="56" height="3" rx="1.5" fill="#ffffff" opacity="0.28" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <div className={`mt-3 flex items-center gap-1.5 ${tone.ink}`}>
        {Array.from({ length: MAX_LEVEL }).map((_, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={{ opacity: i < level ? 1 : 0.15, scaleY: i < level ? 1.4 : 1 }}
            className={`h-1.5 flex-1 rounded-full ${i < level ? 'bg-leaf-500' : 'bg-current'}`}
          />
        ))}
      </div>
    </GlassCard>
  )
}
