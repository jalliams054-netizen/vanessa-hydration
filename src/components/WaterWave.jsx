import { motion } from 'framer-motion'
import { CREST, SPAN, crestShapes } from '../lib/wave.js'

const FRONT = crestShapes(6, 13)
const BACK = crestShapes(4.5, 16)

// The crest rides above the water line, so a 100% fill would clip it against the
// top of the card.
const MAX_FILL = 0.93

export default function WaterWave({ tone, level = 0 }) {
  const clamped = Math.max(0, Math.min(1, level))

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0"
      initial={{ height: 0 }}
      animate={{ height: `${clamped * MAX_FILL * 100}%` }}
      transition={{ type: 'spring', stiffness: 55, damping: 17, mass: 0.9 }}
    >
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${tone.wave.crest} 0%, ${tone.wave.deep} 100%)` }}
      />
      {clamped > 0.02 ? (
        <>
          <div className="absolute inset-x-0 top-0 h-6 bg-white/20 blur-[2px]" />

          <svg
            className="wave-back absolute left-0"
            viewBox={`0 0 ${SPAN} ${CREST}`}
            preserveAspectRatio="none"
            style={{ top: -16 }}
            aria-hidden
          >
            <path d={BACK.body} fill={tone.wave.crest} opacity="0.55" />
          </svg>

          <svg
            className="wave-front absolute left-0"
            viewBox={`0 0 ${SPAN} ${CREST}`}
            preserveAspectRatio="none"
            style={{ top: -13 }}
            aria-hidden
          >
            <path d={FRONT.body} fill={tone.wave.crest} />
            <path d={FRONT.line} fill="none" stroke={tone.wave.foam} strokeWidth="1.6" opacity="0.8" />
          </svg>
        </>
      ) : null}
    </motion.div>
  )
}
