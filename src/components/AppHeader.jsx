import GlassCard from './GlassCard.jsx'

const GREETINGS = {
  morning: 'Good morning',
  afternoon: 'Afternoon, gorgeous',
  night: 'Night owl mode',
}

export default function AppHeader({ tone, phase }) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${tone.muted}`}>
          {GREETINGS[phase]}
        </p>
        <h1 className="font-display text-[1.6rem] leading-tight font-bold sm:text-[1.9rem]">
          <span className={tone.ink}>Vanessa</span>
          <span className={tone.muted}>&rsquo;s garden</span>
        </h1>
      </div>

      <GlassCard
        tone={tone}
        as="div"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl"
      >
        <span role="img" aria-label="water droplet">
          💧
        </span>
      </GlassCard>
    </header>
  )
}
