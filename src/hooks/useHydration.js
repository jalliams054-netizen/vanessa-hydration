import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_GOAL,
  QUICK_SIP,
  STATE_VERSION,
  clampGoal,
  dayKey,
  deriveMetrics,
  withEntry,
  withGoal,
} from '../lib/hydration.js'
import { STORAGE_KEYS, loadJSON, saveJSON } from '../lib/storage.js'
import { useTodayKey } from './useTodayKey.js'

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`

const emptyState = () => ({ version: STATE_VERSION, goal: DEFAULT_GOAL, logs: {} })

function normalize(saved) {
  if (!saved || saved.version !== STATE_VERSION || typeof saved.logs !== 'object' || saved.logs === null) {
    return emptyState()
  }

  const logs = {}
  for (const [day, entries] of Object.entries(saved.logs)) {
    if (!DAY_PATTERN.test(day) || !Array.isArray(entries)) continue
    const clean = entries
      .filter((entry) => Number.isFinite(entry?.ml) && entry.ml > 0)
      .map((entry) => ({ ml: Math.round(entry.ml), at: entry.at ?? Date.now(), id: entry.id ?? newId() }))
    if (clean.length > 0) logs[day] = clean
  }

  return { version: STATE_VERSION, goal: clampGoal(saved.goal), logs }
}

export function useHydration() {
  const [state, setState] = useState(() => normalize(loadJSON(STORAGE_KEYS.state, null)))
  const today = useTodayKey()

  useEffect(() => {
    saveJSON(STORAGE_KEYS.state, state)
  }, [state])

  const log = useCallback((ml) => {
    const amount = Math.round(ml)
    if (!Number.isFinite(amount) || amount <= 0) return
    setState((prev) => withEntry(prev, dayKey(), { ml: amount, at: Date.now(), id: newId() }))
  }, [])

  const sip = useCallback(() => log(QUICK_SIP), [log])

  const setGoal = useCallback((goal) => {
    setState((prev) => withGoal(prev, goal))
  }, [])

  const metrics = useMemo(
    () => deriveMetrics({ logs: state.logs, goal: state.goal, today }),
    [state.logs, state.goal, today],
  )

  return {
    ...metrics,
    today,
    log,
    sip,
    setGoal,
  }
}
