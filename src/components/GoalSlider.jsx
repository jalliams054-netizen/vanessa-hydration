import { GOAL_MAX, GOAL_MIN, GOAL_STEP } from '../lib/hydration.js'
import { tapHaptic } from '../lib/haptics.js'

export default function GoalSlider({ tone, value, onChange }) {
  const fill = ((value - GOAL_MIN) / (GOAL_MAX - GOAL_MIN)) * 100

  return (
    <input
      type="range"
      className="goal-range"
      min={GOAL_MIN}
      max={GOAL_MAX}
      step={GOAL_STEP}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      onPointerUp={tapHaptic}
      aria-label="Daily water goal"
      aria-valuetext={`${value} millilitres`}
      style={{ '--fill': `${fill}%`, '--fill-color': tone.wave.deep }}
    />
  )
}
