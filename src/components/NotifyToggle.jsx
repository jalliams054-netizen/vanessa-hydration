import { motion } from 'framer-motion'
import { tapHaptic } from '../lib/haptics.js'

const STATE = {
  on: { glyph: '🔔', title: 'Nagging is on — tap to silence' },
  off: { glyph: '🔕', title: 'Turn on sassy reminders' },
  denied: { glyph: '🚫', title: 'Blocked — allow notifications in browser settings' },
  unsupported: { glyph: '💤', title: 'Notifications unsupported here' },
}

export default function NotifyToggle({ tone, permission, enabled, onToggle }) {
  const state =
    permission === 'denied'
      ? STATE.denied
      : permission === 'unsupported'
        ? STATE.unsupported
        : enabled
          ? STATE.on
          : STATE.off

  return (
    <motion.button
      type="button"
      aria-pressed={enabled}
      title={state.title}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        tapHaptic()
        onToggle()
      }}
      className={`${tone.card} ${tone.hairline} flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl`}
    >
      <span role="img" aria-label={state.title}>
        {state.glyph}
      </span>
    </motion.button>
  )
}
