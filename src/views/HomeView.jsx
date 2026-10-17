import { ChevronRight, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard.jsx'
import HydrationCard from '../components/HydrationCard.jsx'
import QuickAddBar from '../components/QuickAddBar.jsx'
import StreakCard from '../components/StreakCard.jsx'
import { tapHaptic } from '../lib/haptics.js'

export default function HomeView({ tone, water, onEditGoal }) {
  return (
    <div className="flex flex-col gap-4">
      <HydrationCard tone={tone} metrics={water} />
      <QuickAddBar tone={tone} log={water.log} sip={water.sip} />

      <motion.div whileTap={{ scale: 0.98 }}>
        <GlassCard
          tone={tone}
          as="button"
          type="button"
          onClick={() => {
            tapHaptic()
            onEditGoal()
          }}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <span className={`rounded-full border p-2 ${tone.chip}`}>
            <Target className="h-4 w-4" strokeWidth={2.1} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block text-sm font-bold ${tone.ink}`}>Daily goal</span>
            <span className={`block text-xs font-medium ${tone.muted}`}>
              Tap to change how much counts as a win
            </span>
          </span>
          <span className={`font-display text-lg font-bold tabular-nums ${tone.ink}`}>
            {water.goal}
            <span className="ml-0.5 text-xs font-semibold opacity-70">ml</span>
          </span>
          <ChevronRight className={`h-4 w-4 shrink-0 ${tone.muted}`} aria-hidden />
        </GlassCard>
      </motion.div>

      <StreakCard tone={tone} metrics={water} />
    </div>
  )
}
