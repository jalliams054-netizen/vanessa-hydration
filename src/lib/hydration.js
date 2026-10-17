export const DEFAULT_GOAL = 2000
export const QUICK_SIP = 150
export const STATE_VERSION = 1

export const GOAL_MIN = 1000
export const GOAL_MAX = 4000
export const GOAL_STEP = 50
export const MAX_PLANT_LEVEL = 5
export const LEVEL_UNITS = 3

export const MILESTONES = [
  { at: 3, reward: '🌱', name: 'First Sprout' },
  { at: 7, reward: '🦆', name: 'Duck of Approval' },
  { at: 14, reward: '👑', name: 'Hydration Queen' },
  { at: 30, reward: '🛸', name: 'Alien Abduction' },
]

const pad = (n) => String(n).padStart(2, '0')
const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

export function clampGoal(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_GOAL
  return clamp(Math.round(value / GOAL_STEP) * GOAL_STEP, GOAL_MIN, GOAL_MAX)
}

export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function shiftDay(key, delta) {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + delta)
  return dayKey(date)
}

export function dayTotals(logs) {
  const totals = {}
  for (const [key, entries] of Object.entries(logs)) {
    totals[key] = entries.reduce((sum, entry) => sum + entry.ml, 0)
  }
  return totals
}

export function appendEntry(logs, day, entry) {
  const existing = logs[day] ?? []
  return { ...logs, [day]: [...existing, entry] }
}

export function withEntry(state, day, entry) {
  return { ...state, logs: appendEntry(state.logs, day, entry) }
}

export function withGoal(state, goal) {
  return { ...state, goal: clampGoal(goal) }
}

function isMet(totals, day, goal) {
  return (totals[day] ?? 0) >= goal
}

export function computeStreak(totals, goal, today) {
  if (goal <= 0) return { current: 0, metToday: false, atRisk: false }
  const metToday = isMet(totals, today, goal)
  let current = 0
  let cursor = metToday ? today : shiftDay(today, -1)
  while (isMet(totals, cursor, goal)) {
    current += 1
    cursor = shiftDay(cursor, -1)
  }
  return { current, metToday, atRisk: !metToday && current > 0 }
}

export function computeBestStreak(totals, goal, today) {
  if (goal <= 0) return 0
  const metDays = new Set(
    Object.keys(totals)
      .filter((key) => key <= today && isMet(totals, key, goal))
      .sort(),
  )
  let best = 0
  for (const day of metDays) {
    if (metDays.has(shiftDay(day, -1))) continue
    let run = 0
    let cursor = day
    while (metDays.has(cursor)) {
      run += 1
      cursor = shiftDay(cursor, 1)
    }
    best = Math.max(best, run)
  }
  return best
}

const PLANT_STAGES = {
  1: { happy: 'A timid little sprout', sad: 'Barely a twig, honestly' },
  2: { happy: 'Two brave little leaves', sad: 'Looking a bit thirsty' },
  3: { happy: 'Perky fronds — she likes you', sad: 'Sulking, and it knows it' },
  4: { happy: 'Lush and showing off', sad: 'Dramatically drooping' },
  5: { happy: 'Full jungle energy', sad: 'Wilting diva mode' },
}

export function computePlant({ streak, metToday, yesterdayMet, consumed, goal, hasHistory }) {
  const health = goal > 0 ? clamp(consumed / goal, 0, 1) : 0
  const level = clamp(Math.floor((streak + (metToday ? 1 : 0)) / LEVEL_UNITS) + 1, 1, MAX_PLANT_LEVEL)
  const drooping = hasHistory && !metToday && yesterdayMet === false
  const stage = PLANT_STAGES[level][drooping ? 'sad' : 'happy']
  return { level, health, drooping, stage }
}

export function plantProgress({ streak, metToday, level }) {
  const units = streak + (metToday ? 1 : 0)
  if (level >= MAX_PLANT_LEVEL) return { units, toNext: 0, atMax: true }
  return { units, toNext: level * LEVEL_UNITS - units, atMax: false }
}

export function unlockedRewards(streak) {
  return MILESTONES.map((milestone) => ({
    ...milestone,
    unlocked: streak >= milestone.at,
  }))
}

export function shouldCelebrate({ metToday, celebratedDay, today }) {
  return metToday === true && celebratedDay !== today
}

export function deriveMetrics({ logs, goal, today }) {
  const totals = dayTotals(logs)
  const consumed = totals[today] ?? 0
  const { current, metToday, atRisk } = computeStreak(totals, goal, today)
  const yesterdayMet = isMet(totals, shiftDay(today, -1), goal)
  const pct = goal > 0 ? Math.round((consumed / goal) * 100) : 0
  const plant = computePlant({
    streak: current,
    metToday,
    yesterdayMet,
    consumed,
    goal,
    hasHistory: Object.keys(totals).length > 0,
  })

  return {
    consumed,
    goal,
    remaining: Math.max(0, goal - consumed),
    pct,
    cappedPct: clamp(pct, 0, 100),
    metToday,
    streak: current,
    atRisk,
    bestStreak: computeBestStreak(totals, goal, today),
    sipsToday: (logs[today] ?? []).length,
    plant: { ...plant, progress: plantProgress({ streak: current, metToday, level: plant.level }) },
    rewards: unlockedRewards(current),
  }
}
