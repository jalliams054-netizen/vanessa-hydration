import { useEffect, useRef } from 'react'
import { parseQuickAction } from '../lib/deepLink.js'
import { glassHaptic } from '../lib/haptics.js'

export function useQuickActionLog(log) {
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true
    const action = parseQuickAction(window.location.search)
    if (!action) return
    history.replaceState(null, '', window.location.pathname)
    log(action.ml)
    glassHaptic()
  }, [log])

  useEffect(() => {
    const worker = navigator.serviceWorker
    if (!worker) return undefined
    const onMessage = (event) => {
      if (event.data?.type !== 'quick-log') return
      const action = parseQuickAction(`?action=log&ml=${event.data.ml}`)
      if (!action) return
      log(action.ml)
      glassHaptic()
    }
    worker.addEventListener('message', onMessage)
    return () => worker.removeEventListener('message', onMessage)
  }, [log])
}
