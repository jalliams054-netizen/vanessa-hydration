import { useEffect, useState } from 'react'
import { shouldCelebrate } from '../lib/hydration.js'
import { successHaptic } from '../lib/haptics.js'
import { STORAGE_KEYS, loadJSON, saveJSON } from '../lib/storage.js'

export function useGoalCelebration(metToday, today) {
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    const celebratedDay = loadJSON(STORAGE_KEYS.celebrated, null)
    if (!shouldCelebrate({ metToday, celebratedDay, today })) return
    saveJSON(STORAGE_KEYS.celebrated, today)
    successHaptic()
    setNonce((n) => n + 1)
  }, [metToday, today])

  return nonce
}
