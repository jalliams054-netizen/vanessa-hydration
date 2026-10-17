import { motion } from 'framer-motion'
import { tapHaptic } from '../lib/haptics.js'

export default function SassyButton({
  tone,
  label,
  hint,
  emphasis = false,
  onClick,
  haptic = tapHaptic,
  className = '',
}) {
  return (
    <motion.button
      type="button"
      onClick={(event) => {
        haptic()
        onClick?.(event)
      }}
      whileTap={{ scale: 0.92, y: 1 }}
      whileHover={{ scale: 1.03 }}
      whileFocus={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 520, damping: 24 }}
      className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl border px-3 py-3 font-semibold shadow-glass backdrop-blur-xl transition-colors duration-200 ${
        emphasis ? 'border-white/50 bg-droplet-400/85 text-white' : tone.button
      } ${className}`}
    >
      <span className="text-base leading-tight">{label}</span>
      {hint ? <span className="text-[11px] font-medium opacity-70">{hint}</span> : null}
    </motion.button>
  )
}
