const canVibrate = () => {
  try {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
  } catch {
    return false
  }
}

function fire(pattern) {
  if (!canVibrate()) return false
  try {
    return navigator.vibrate(pattern)
  } catch {
    return false
  }
}

export const tapHaptic = () => fire(12)
export const sipHaptic = () => fire([8, 20, 14])
export const glassHaptic = () => fire([14, 30, 22])
export const successHaptic = () => fire([30, 40, 30, 50, 110])
export const levelUpHaptic = () => fire([18, 45, 26])
