import { motion } from 'framer-motion'
import GlassCard from './GlassCard.jsx'

export default function StreakCard({ tone, metrics }) {
  const { streak, bestStreak, atRisk, rewards } = metrics

  return (
    <GlassCard tone={tone} className="p-5">
      <div className="flex items-end justify-between">
        <motion.p
          key={streak}
          initial={{ scale: 0.85, opacity: 0.3 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 18 }}
          className={`font-display text-3xl font-bold tabular-nums ${tone.ink}`}
        >
          {streak}
          <span className="ml-1.5 text-base font-semibold opacity-70">day streak</span>
        </motion.p>
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
            atRisk ? 'border-amber-400/70 bg-amber-300/40 text-amber-900' : tone.chip
          }`}
        >
          {atRisk ? 'streak at risk' : `best ${bestStreak}`}
        </span>
      </div>

      <div className="mt-4 flex gap-2.5">
        {rewards.map((reward) => (
          <div
            key={reward.at}
            title={`${reward.name} · ${reward.at} days`}
            className={`flex flex-1 flex-col items-center gap-1 rounded-2xl border py-2.5 ${
              reward.unlocked
                ? tone.chip
                : 'border-transparent bg-black/10 opacity-45 grayscale'
            }`}
          >
            <span className="text-xl leading-none">{reward.reward}</span>
            <span className="text-[10px] font-bold tabular-nums">{reward.at}d</span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
