import { motion } from 'framer-motion'
import { BellRing, Sparkles } from 'lucide-react'
import GlassCard from '../components/GlassCard.jsx'
import GoalSlider from '../components/GoalSlider.jsx'
import NotifyToggle from '../components/NotifyToggle.jsx'
import SassyButton from '../components/SassyButton.jsx'
import { GOAL_MAX, GOAL_MIN } from '../lib/hydration.js'
import { REMINDER_CONFIG } from '../lib/notifications.js'

const PRESETS = [1500, 2000, 2500, 3000, 4000]

const hourLabel = (hour) => `${hour}:00`

function reminderStatus({ permission, enabled, countToday }) {
  if (permission === 'unsupported') return 'This browser has no notifications. The plant will have to judge silently.'
  if (permission === 'denied') return 'Blocked in your browser settings — unblock it and tap the bell again.'
  if (enabled) return `On — ${countToday} ${countToday === 1 ? 'nag' : 'nags'} today, ${REMINDER_CONFIG.maxPerDay} max.`
  return 'Off. She behaves herself when you are not watching.'
}

export default function SettingsView({ tone, water, reminders }) {
  const { goal, consumed, setGoal } = water

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className={`font-display text-2xl font-bold ${tone.ink}`}>Settings</h2>
        <p className={`text-sm font-medium ${tone.muted}`}>This is your garden, Vanessa.</p>
      </div>

      <GlassCard tone={tone} className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${tone.muted}`}>
              Daily target
            </p>
            <p className={`font-display text-4xl font-bold leading-none tabular-nums ${tone.ink}`}>
              {goal}
              <span className="ml-1 text-base font-semibold opacity-70">ml</span>
            </p>
          </div>
          <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-bold ${tone.chip}`}>
            {Math.round(goal / 250)} glasses
          </span>
        </div>

        <div className="mt-4">
          <GoalSlider tone={tone} value={goal} onChange={setGoal} />
          <div className={`flex justify-between text-[10px] font-bold tabular-nums ${tone.muted}`}>
            <span>{GOAL_MIN} ml</span>
            <span>{GOAL_MAX} ml</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <motion.button
              key={preset}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setGoal(preset)}
              className={`rounded-full border px-2.5 py-1.5 text-xs font-bold tabular-nums transition-colors ${
                preset === goal ? tone.chip : `${tone.hairline} bg-white/10 ${tone.muted}`
              }`}
            >
              {preset}
            </motion.button>
          ))}
        </div>

        <p className={`mt-4 text-sm font-medium ${tone.muted}`}>
          {consumed >= goal
            ? `Already at ${consumed} ml today — this target is in the bag.`
            : `${goal - consumed} ml left today at this target.`}
        </p>
      </GlassCard>

      <GlassCard tone={tone} className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`flex items-center gap-2 font-display text-lg font-bold ${tone.ink}`}>
              <BellRing className="h-4 w-4" strokeWidth={2.2} aria-hidden />
              Sassy reminders
            </p>
            <p className={`mt-1 text-sm font-medium ${tone.muted}`}>
              {reminderStatus(reminders)}
            </p>
          </div>
          <NotifyToggle
            tone={tone}
            permission={reminders.permission}
            enabled={reminders.enabled}
            onToggle={reminders.toggle}
          />
        </div>

        <p className={`mt-3 text-xs font-medium ${tone.muted}`}>
          {hourLabel(REMINDER_CONFIG.firstHour)}–{hourLabel(REMINDER_CONFIG.quietStartHour)}, at most{' '}
          {REMINDER_CONFIG.maxPerDay} a day, and never within{' '}
          {Math.round(REMINDER_CONFIG.minGapMs / 60000)} minutes of the last one. Silent once you hit
          your target.
        </p>

        {reminders.permission === 'granted' ? (
          <div className="mt-4 flex">
            <SassyButton
              tone={tone}
              label="Send one now"
              hint="you asked for this"
              emphasis
              onClick={reminders.nag}
            />
          </div>
        ) : null}
      </GlassCard>

      <GlassCard tone={tone} className="flex items-start gap-3 p-4">
        <span className={`rounded-full border p-2 ${tone.chip}`}>
          <Sparkles className="h-4 w-4" strokeWidth={2.1} aria-hidden />
        </span>
        <p className={`text-xs font-medium leading-relaxed ${tone.muted}`}>
          Everything lives on this phone — logs, streak, plant and target are stored locally, so the
          garden keeps growing with no signal. Lowering your target can finish a day you had already
          written off.
        </p>
      </GlassCard>
    </div>
  )
}
