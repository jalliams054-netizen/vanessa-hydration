import SassyButton from './SassyButton.jsx'
import { QUICK_SIP } from '../lib/hydration.js'
import { glassHaptic, sipHaptic } from '../lib/haptics.js'

export default function QuickAddBar({ tone, log, sip }) {
  return (
    <div className="flex items-stretch gap-3">
      <SassyButton tone={tone} label="250 ml" hint="one glass" haptic={glassHaptic} onClick={() => log(250)} />
      <SassyButton tone={tone} label="500 ml" hint="big gulp" haptic={glassHaptic} onClick={() => log(500)} />
      <SassyButton
        tone={tone}
        label={`+ ${QUICK_SIP}`}
        hint="quick sip"
        emphasis
        haptic={sipHaptic}
        onClick={sip}
      />
    </div>
  )
}
