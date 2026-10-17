import { useCallback, useEffect, useRef, useState } from 'react'
import { dayKey } from '../lib/hydration.js'
import {
  REMINDER_CONFIG,
  SASSY_MESSAGES,
  displayNotification,
  pickMessage,
  shouldRemind,
} from '../lib/notifications.js'
import { currentRegistration } from '../lib/serviceWorker.js'
import { STORAGE_KEYS, loadJSON, saveJSON } from '../lib/storage.js'

const supported = () => typeof Notification !== 'undefined'

const numberOr = (value, fallback) => (Number.isFinite(value) ? value : fallback)

const readState = () => {
  const saved = loadJSON(STORAGE_KEYS.reminders, null)
  return {
    enabled: saved?.enabled === true,
    day: typeof saved?.day === 'string' ? saved.day : null,
    countToday: numberOr(saved?.countToday, 0),
    lastAt: numberOr(saved?.lastAt, null),
    lastIndex: numberOr(saved?.lastIndex, -1),
  }
}

export function useReminders({ metToday }) {
  const [state, setState] = useState(readState)
  const [permission, setPermission] = useState(() => (supported() ? Notification.permission : 'unsupported'))
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
    saveJSON(STORAGE_KEYS.reminders, state)
  }, [state])

  const nag = useCallback(async () => {
    const today = dayKey()
    const current = stateRef.current
    const count = current.day === today ? current.countToday : 0
    const message = pickMessage(current.lastIndex, SASSY_MESSAGES)
    setState((prev) => ({
      ...prev,
      enabled: true,
      day: today,
      countToday: count + 1,
      lastAt: Date.now(),
      lastIndex: message.index,
    }))
    return displayNotification(await currentRegistration(), message)
  }, [])

  const toggle = useCallback(async () => {
    if (!supported()) return
    if (stateRef.current.enabled) {
      setState((prev) => ({ ...prev, enabled: false }))
      return
    }
    if (Notification.permission === 'denied') {
      setPermission('denied')
      return
    }
    const granted =
      Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
    setPermission(granted)
    if (granted !== 'granted') return
    const shown = await nag()
    if (!shown) setState((prev) => ({ ...prev, enabled: false }))
  }, [nag])

  useEffect(() => {
    if (!state.enabled || permission !== 'granted') return undefined

    const check = () => {
      const now = new Date()
      const today = dayKey(now)
      const current = stateRef.current
      const sameDay = current.day === today

      if (
        shouldRemind({
          hour: now.getHours(),
          now: now.getTime(),
          lastAt: sameDay ? current.lastAt : null,
          metToday,
          countToday: sameDay ? current.countToday : 0,
          enabled: true,
        })
      ) {
        nag()
      }
    }

    const interval = setInterval(check, REMINDER_CONFIG.tickMs)
    return () => clearInterval(interval)
  }, [state.enabled, permission, metToday, nag])

  const countToday = state.day === dayKey() ? state.countToday : 0

  return { permission, enabled: state.enabled, countToday, toggle, nag }
}
