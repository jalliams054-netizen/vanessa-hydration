import { AnimatePresence, motion } from 'framer-motion'

export default function SkyBackground({ tone, phase }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={phase}
          className={`absolute inset-0 ${tone.root}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        >
          <div className={`absolute -top-24 -right-20 h-80 w-80 rounded-full opacity-70 blur-2xl ${tone.orbTop}`} />
          <div className={`absolute bottom-[-8rem] -left-24 h-96 w-96 rounded-full opacity-60 blur-3xl ${tone.orbBottom}`} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgb(255_255_255/0.35),transparent_55%)]" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(to_top,rgb(8_16_32/0.18),transparent)]" />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
