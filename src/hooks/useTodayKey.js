import { useEffect, useState } from 'react'
import { dayKey } from '../lib/hydration.js'

export function useTodayKey() {
  const [today, setToday] = useState(() => dayKey())

  useEffect(() => {
    const refresh = () => setToday(dayKey())
    const interval = setInterval(refresh, 60_000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return today
}
