import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard.jsx'
import VirtualPlant from '../components/VirtualPlant.jsx'
import { LEVEL_UNITS, MAX_PLANT_LEVEL } from '../lib/hydration.js'

function Stat({ tone, label, value, unit }) {
  return (
    <div className={`rounded-2xl border px-3 py-2.5 ${tone.hairline} bg-white/10`}>
      <p className={`text-[10px] font-bold uppercase tracking-[0.1em] ${tone.muted}`}>{label}</p>
      <p className={`font-display text-xl font-bold tabular-nums ${tone.ink}`}>
        {value}
        {unit ? <span className="ml-1 text-xs font-semibold opacity-70">{unit}</span> : null}
      </p>
    </div>
  )
}

export default function PlantView({ tone, water }) {
  const { plant, streak, bestStreak, consumed, goal, sipsToday } = water
  const { level, health, progress } = plant
  const intoLevel = progress.atMax ? 1 : (progress.units % LEVEL_UNITS) / LEVEL_UNITS

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className={`font-display text-2xl font-bold ${tone.ink}`}>Her plant</h2>
          <p className={`text-sm font-medium ${tone.muted}`}>{plant.stage}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${tone.chip}`}>
          Level {level} of {MAX_PLANT_LEVEL}
        </span>
      </div>

      <VirtualPlant tone={tone} plant={plant} hero />

      <GlassCard tone={tone} className="p-4">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className={tone.ink}>
            {progress.atMax ? 'Fully grown — no notes' : `Next leaf in ${progress.toNext} ${progress.toNext === 1 ? 'day' : 'days'}`}
          </span>
          <span className={`tabular-nums ${tone.muted}`}>{Math.round(intoLevel * 100)}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/15">
          <motion.div
            className="h-full rounded-full bg-leaf-500"
            initial={false}
            animate={{ width: `${Math.round(intoLevel * 100)}%` }}
            transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          />
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <Stat tone={tone} label="Today" value={consumed} unit="ml" />
        <Stat tone={tone} label="Sips" value={sipsToday} />
        <Stat tone={tone} label="Plant health" value={Math.round(health * 100)} unit="%" />
        <Stat tone={tone} label="Goal" value={goal} unit="ml" />
        <Stat tone={tone} label="Streak" value={streak} unit="days" />
        <Stat tone={tone} label="Best" value={bestStreak} unit="days" />
      </div>

      <GlassCard tone={tone} className="p-4">
        <h3 className={`font-display text-base font-bold ${tone.ink}`}>Milestones</h3>
        <ul className="mt-2 flex flex-col gap-2">
          {water.rewards.map((reward) => (
            <li key={reward.at} className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-lg ${
                  reward.unlocked ? tone.chip : 'border-transparent bg-black/10 opacity-40 grayscale'
                }`}
              >
                {reward.reward}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-bold ${reward.unlocked ? tone.ink : tone.muted}`}>
                  {reward.name}
                </span>
                <span className={`block text-[11px] font-medium ${tone.muted}`}>
                  {reward.unlocked ? 'Unlocked' : `${reward.at - streak} more days`}
                </span>
              </span>
              <span className={`text-xs font-bold tabular-nums ${tone.muted}`}>{reward.at}d</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  )
}
