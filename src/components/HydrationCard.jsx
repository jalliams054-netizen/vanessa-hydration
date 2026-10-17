import { motion } from 'framer-motion'
import GlassCard from './GlassCard.jsx'
import WaterWave from './WaterWave.jsx'

const MARKS = [
  { at: 0.25, label: '¼' },
  { at: 0.5, label: '½' },
  { at: 0.75, label: '¾' },
]

function caption({ metToday, remaining, pct, sipsToday }) {
  if (metToday) return 'Goal smashed. The plant owes you a compliment.'
  if (pct >= 75) return `${remaining} ml left — you were this close, Vanessa.`
  if (sipsToday === 0) return 'Nothing logged yet. The plant is judging silently.'
  return `${remaining} ml to go — the plant is watching.`
}

export default function HydrationCard({ tone, metrics }) {
  const { consumed, goal, cappedPct, remaining, metToday, pct, sipsToday } = metrics

  return (
    <GlassCard tone={tone} className="overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <h2 className={`font-display text-lg font-bold ${tone.ink}`}>
          Today&rsquo;s pour
          <span className={`ml-2 text-sm font-semibold ${tone.muted}`}>
            {sipsToday} {sipsToday === 1 ? 'sip' : 'sips'}
          </span>
        </h2>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold tabular-nums ${tone.chip}`}>
          {pct}% of {goal} ml
        </span>
      </div>

      <motion.div
        className={`relative mt-4 h-44 w-full overflow-hidden rounded-[1.75rem] border ${tone.hairline} bg-white/15`}
        initial={false}
        animate={{
          boxShadow: metToday
            ? '0 0 0 3px rgba(255,255,255,0.5), 0 22px 45px -12px rgba(80,190,230,0.55)'
            : '0 0 0 0px rgba(255,255,255,0), 0 10px 30px -18px rgba(11,25,48,0.4)',
        }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <WaterWave tone={tone} level={cappedPct / 100} />

        <div className="absolute inset-0">
          {MARKS.map((mark) => (
            <div
              key={mark.label}
              className={`absolute right-3 flex items-center gap-2 ${tone.ink}`}
              style={{ bottom: `${mark.at * 100}%` }}
            >
              <span className="text-[10px] font-semibold opacity-60">{mark.label}</span>
              <span className="h-px w-6 bg-current opacity-30" />
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
          <motion.p
            key={consumed}
            initial={{ scale: 0.9, y: 6, opacity: 0.4 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
            className={`font-display text-4xl font-bold leading-none tabular-nums drop-shadow-sm ${tone.ink}`}
          >
            {consumed}
            <span className="ml-1 text-base font-semibold opacity-70">ml</span>
          </motion.p>
          {metToday ? (
            <motion.span
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 12 }}
              className="text-2xl leading-none"
              role="img"
              aria-label="goal reached"
            >
              ✅
            </motion.span>
          ) : null}
        </div>
      </motion.div>

      <p className={`mt-3 text-sm font-medium ${tone.muted}`}>
        {caption({ metToday, remaining, pct, sipsToday })}
      </p>
    </GlassCard>
  )
}
