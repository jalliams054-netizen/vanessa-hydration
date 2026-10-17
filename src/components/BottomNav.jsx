import { motion } from 'framer-motion'
import { Droplet, SlidersHorizontal, Sprout } from 'lucide-react'
import { tapHaptic } from '../lib/haptics.js'

export const TABS = [
  { key: 'home', label: 'Home', Icon: Droplet },
  { key: 'plant', label: 'Plant', Icon: Sprout },
  { key: 'settings', label: 'Settings', Icon: SlidersHorizontal },
]

export default function BottomNav({ tone, active, onSelect }) {
  return (
    <nav
      className={`relative z-20 shrink-0 border-t backdrop-blur-xl ${tone.hairline} ${tone.bar}`}
      aria-label="Sections"
    >
      <ul className="mx-auto flex w-full max-w-md items-stretch justify-around gap-1 px-3 pt-1.5 safe-bottom">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = key === active
          return (
            <li key={key} className="flex-1">
              <motion.button
                type="button"
                aria-current={isActive ? 'page' : undefined}
                whileTap={{ scale: 0.88 }}
                transition={{ type: 'spring', stiffness: 480, damping: 26 }}
                onClick={() => {
                  tapHaptic()
                  onSelect(key)
                }}
                className={`relative flex w-full flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold uppercase tracking-[0.08em] transition-colors duration-200 ${
                  isActive ? tone.ink : tone.muted
                }`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="tab-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className={`absolute inset-0 rounded-2xl border ${tone.chip}`}
                  />
                ) : null}
                <Icon
                  className="relative h-[22px] w-[22px]"
                  strokeWidth={isActive ? 2.3 : 1.7}
                  aria-hidden
                />
                <span className="relative">{label}</span>
              </motion.button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
