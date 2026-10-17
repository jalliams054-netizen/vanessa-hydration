const store = new Map()
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
}

const H = await import('../src/lib/hydration.js')
const S = await import('../src/lib/storage.js')
const W = await import('../src/lib/wave.js')
const N = await import('../src/lib/notifications.js')
const D = await import('../src/lib/deepLink.js')

let failures = 0
const sortKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sortKeys(value[k])]))
  }
  return value
}
const check = (name, actual, expected) => {
  const a = JSON.stringify(sortKeys(actual))
  const e = JSON.stringify(sortKeys(expected))
  const ok = a === e
  if (!ok) failures += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `\n      expected ${e}\n      actual   ${a}`}`)
}

const G = 2000
const today = '2026-10-17'
const e = (ml) => ({ ml, at: 0, id: String(ml) })
const logsFrom = (spec) =>
  Object.fromEntries(Object.entries(spec).map(([d, ml]) => [d, [e(ml)]]))

// 1. brand-new user: no logs, no false wilting
check('fresh: totals/streak', omit(H.deriveMetrics({ logs: {}, goal: G, today }), ['rewards']), {
  consumed: 0, goal: G, remaining: G, pct: 0, cappedPct: 0, metToday: false,
  streak: 0, atRisk: false, bestStreak: 0, sipsToday: 0,
  plant: { level: 1, health: 0, drooping: false, stage: 'A timid little sprout',
    progress: { units: 0, toNext: 3, atMax: false } },
})
check('rewards unlock by streak', H.unlockedRewards(14).map((r) => r.unlocked), [true, true, true, false])

// 2. today's maths
check('pct 1250/2000', pick(H.deriveMetrics({ logs: { [today]: [e(250), e(500), e(500)] }, goal: G, today })), {
  consumed: 1250, pct: 63, remaining: 750, cappedPct: 63, sipsToday: 3, metToday: false, atRisk: false,
})
check('over-goal clamps pct', pick(H.deriveMetrics({ logs: { [today]: [e(1500), e(900)] }, goal: G, today })), {
  consumed: 2400, pct: 120, remaining: 0, cappedPct: 100, sipsToday: 2, metToday: true, atRisk: false,
})

// 3. streak alive but at risk (goal met yesterday, not today)
const alive = logsFrom({ [today]: 1250, '2026-10-16': 2000, '2026-10-15': 2100, '2026-10-14': 2000 })
check('alive: counts from yesterday', pick(H.deriveMetrics({ logs: alive, goal: G, today })), {
  consumed: 1250, pct: 63, remaining: 750, cappedPct: 63, sipsToday: 1, metToday: false, atRisk: true,
})
check('alive: streak/best/plant', streakShape(H.deriveMetrics({ logs: alive, goal: G, today })), {
  streak: 3, bestStreak: 3, level: 2, drooping: false,
})

// 4. goal hit today extends the streak
const done = logsFrom({ [today]: 2000, '2026-10-16': 2000, '2026-10-15': 2000 })
check('met today: streak 3 atRisk false', streakShape(H.deriveMetrics({ logs: done, goal: G, today })), {
  streak: 3, bestStreak: 3, level: 2, drooping: false,
})

// 5. missed yesterday breaks the streak, plant wilts
const broken = logsFrom({ [today]: 300, '2026-10-16': 500, '2026-10-15': 2000, '2026-10-14': 2000 })
check('broken: streak 0 + wilting', streakShape(H.deriveMetrics({ logs: broken, goal: G, today })), {
  streak: 0, bestStreak: 2, level: 1, drooping: true,
})

// 6. best streak survives a gap
const gappy = logsFrom({
  [today]: 0, '2026-10-16': 0, '2026-10-15': 2000, '2026-10-14': 2000, '2026-10-13': 2000,
  '2026-10-12': 900, '2026-10-11': 2500, '2026-10-10': 2000, '2026-10-09': 2000, '2026-10-08': 2000, '2026-10-07': 2000,
})
check('gappy: current 0, best 5', bestOf(H.deriveMetrics({ logs: gappy, goal: G, today })), { streak: 0, bestStreak: 5 })

// 7. future days must not count toward best
check('ignores future logs', bestOf(H.deriveMetrics({ logs: { '2026-12-31': [e(5000)] }, goal: G, today })), {
  streak: 0, bestStreak: 0,
})

// 8. date helpers across month / leap boundaries
check('shiftDay month edge', [H.shiftDay('2026-02-28', 1), H.shiftDay('2028-02-28', 1), H.shiftDay('2026-01-01', -1)], [
  '2026-03-01', '2028-02-29', '2025-12-31',
])
check('dayKey is local time', H.dayKey(new Date(2026, 9, 17, 23, 59, 59)), '2026-10-17')

// 9. appendEntry is immutable + additive
const base = { [today]: [e(250)] }
const added = H.appendEntry(base, today, e(500))
check('append immutability', [base[today].length, added[today].length, H.dayTotals(added)[today]], [1, 2, 750])
check('append new day', Object.keys(H.appendEntry(base, '2026-10-16', e(300))), [today, '2026-10-16'])

// 9b. the hook's reducer must keep the state envelope intact (goal/version survive a log)
const state0 = { version: 1, goal: 2000, logs: base }
const state1 = H.withEntry(state0, today, e(250))
check('withEntry keeps envelope', [state1.version, state1.goal, Object.keys(state1.logs).length], [1, 2000, 1])
check('withEntry appends', H.dayTotals(state1.logs)[today], 500)
check('withEntry immutable', state0.logs[today].length, 1)
check('withEntry feeds deriveMetrics', H.deriveMetrics({ logs: state1.logs, goal: state1.goal, today }).consumed, 500)

// 9c. Vanessa's adjustable target: clamp, persist, and drive every metric
check('clampGoal rounds to step', H.clampGoal(2037), 2050)
check('clampGoal floors at minimum', H.clampGoal(400), H.GOAL_MIN)
check('clampGoal caps at maximum', H.clampGoal(9000), H.GOAL_MAX)
check('clampGoal rejects garbage', [H.clampGoal('abc'), H.clampGoal(null), H.clampGoal(undefined), H.clampGoal(NaN), H.clampGoal('2000')],
  [H.DEFAULT_GOAL, H.DEFAULT_GOAL, H.DEFAULT_GOAL, H.DEFAULT_GOAL, H.DEFAULT_GOAL])
check('clampGoal keeps valid steps', [1000, 1500, 2500, 4000].map(H.clampGoal), [1000, 1500, 2500, 4000])
const goalSet = H.withGoal(state0, 3000)
check('withGoal keeps envelope', [goalSet.version, Object.keys(goalSet.logs).length, goalSet.goal], [1, 1, 3000])
check('withGoal clamps input', H.withGoal(state0, 9999).goal, H.GOAL_MAX)
check('withGoal immutable', state0.goal, 2000)
check('custom goal drives pct', pick(H.deriveMetrics({ logs: { [today]: [e(2000)] }, goal: 4000, today })), {
  consumed: 2000, pct: 50, remaining: 2000, cappedPct: 50, sipsToday: 1, metToday: false, atRisk: false,
})
check('lowered goal rescues the day', pick(H.deriveMetrics({ logs: { [today]: [e(2000)] }, goal: 1500, today })), {
  consumed: 2000, pct: 133, remaining: 0, cappedPct: 100, sipsToday: 1, metToday: true, atRisk: false,
})
check('goal changes rewrite the streak',
  [H.deriveMetrics({ logs: alive, goal: 2000, today }).streak, H.deriveMetrics({ logs: alive, goal: 1000, today }).streak],
  [3, 4])
check('plantProgress counts to next leaf',
  [H.plantProgress({ streak: 0, metToday: false, level: 1 }), H.plantProgress({ streak: 2, metToday: false, level: 1 }),
   H.plantProgress({ streak: 3, metToday: false, level: 2 })],
  [{ units: 0, toNext: 3, atMax: false }, { units: 2, toNext: 1, atMax: false }, { units: 3, toNext: 3, atMax: false }])
check('plantProgress stops counting at max', H.plantProgress({ streak: 20, metToday: true, level: 5 }), { units: 21, toNext: 0, atMax: true })
check('plant levels every 3 met days', [0, 2, 3, 6, 9, 12].map((s) => H.computePlant({
  streak: s, metToday: false, yesterdayMet: true, consumed: 100, goal: G, hasHistory: true }).level),
  [1, 1, 2, 3, 4, 5])
check('plant level caps at 5', H.computePlant({ streak: 99, metToday: true, yesterdayMet: true, consumed: G, goal: G, hasHistory: true }).level, 5)

// 10. storage roundtrip + hostile payloads
S.saveJSON(S.STORAGE_KEYS.state, { version: 1, goal: 2500, logs: { [today]: [{ ml: 250, at: 1, id: 'a' }] } })
check('storage roundtrip', S.loadJSON(S.STORAGE_KEYS.state, null).goal, 2500)
store.set(S.STORAGE_KEYS.state, '{not json')
check('corrupt json falls back', S.loadJSON(S.STORAGE_KEYS.state, 'FALLBACK'), 'FALLBACK')
check('missing key falls back', S.loadJSON('vanessa-hydra:nope', 'FALLBACK'), 'FALLBACK')
store.set('vanessa-hydra:garbage', 'null')
check('json null falls back', S.loadJSON('vanessa-hydra:garbage', 'FALLBACK'), 'FALLBACK')

// 11. goal edge: zero goal
check('goal 0 guard', pick(H.deriveMetrics({ logs: { [today]: [e(500)] }, goal: 0, today })), {
  consumed: 500, pct: 0, remaining: 0, cappedPct: 0, sipsToday: 1, metToday: false, atRisk: false,
})

// 12. celebration fires once per met day
check('celebrate on new goal day', H.shouldCelebrate({ metToday: true, celebratedDay: null, today }), true)
check('no double celebrate same day', H.shouldCelebrate({ metToday: true, celebratedDay: today, today }), false)
check('no celebrate on old day', H.shouldCelebrate({ metToday: true, celebratedDay: '2026-10-16', today }), true)
check('never celebrate unmet day', H.shouldCelebrate({ metToday: false, celebratedDay: null, today }), false)

// 13. wave crest tiles seamlessly (2 full periods across 200 units => -50% loop)
const crest = W.crestShapes(6, 13)
check('crest period tiles', W.SPAN % W.PERIOD === 0 && (W.SPAN / 2) % W.PERIOD === 0, true)
check('crest has 8 quad segments', (crest.line.match(/ q /g) ?? []).length, 8)
check('crest starts and ends on midline', [crest.line.startsWith('M0 13'), crest.line.endsWith(' 0')], [true, true])
check('crest has no NaN', /NaN|undefined/.test(crest.body), false)
check('crest closes below midline', crest.body.endsWith('L200 26 L0 26 Z'), true)

// 14. notification copy + scheduling rules
const cfg = N.REMINDER_CONFIG
const baseReminder = { now: 0, lastAt: null, metToday: false, countToday: 0, enabled: true }
check('15 sassy messages', N.SASSY_MESSAGES.length, 15)
check('every message names Vanessa', N.SASSY_MESSAGES.every((m) => m.body.includes('Vanessa')), true)
check('messages are unique', new Set(N.SASSY_MESSAGES.map((m) => m.body)).size, 15)
check('never repeats the last message', Array.from({ length: 300 }, () => N.pickMessage(7).index).every((i) => i !== 7), true)
check('single message list is safe', N.pickMessage(0, [{ body: 'x' }]).index, 0)
check('quiet at 22:00', N.shouldRemind({ ...baseReminder, hour: 22 }), false)
check('quiet at 06:00', N.shouldRemind({ ...baseReminder, hour: 6 }), false)
check('before first hour', N.shouldRemind({ ...baseReminder, hour: 8 }), false)
check('mid-morning nags', N.shouldRemind({ ...baseReminder, hour: 11 }), true)
check('goal met = silence', N.shouldRemind({ ...baseReminder, hour: 11, metToday: true }), false)
check('toggle off = silence', N.shouldRemind({ ...baseReminder, hour: 11, enabled: false }), false)
check('daily cap', N.shouldRemind({ ...baseReminder, hour: 11, countToday: cfg.maxPerDay }), false)
check('too soon after last nag', N.shouldRemind({ ...baseReminder, hour: 11, now: 30 * 60 * 1000, lastAt: 0, countToday: 1 }), false)
check('after min gap', N.shouldRemind({ ...baseReminder, hour: 11, now: cfg.minGapMs + 1, lastAt: 0, countToday: 1 }), true)
check('notification payload', (() => {
  const o = N.notificationOptions({ body: 'Drink up, Vanessa.' })
  return [o.tag, o.title, o.body, o.actions.map((a) => a.action).join(',')]
})(), ['vanessa-hydra-reminder', 'Vanessa 👀', 'Drink up, Vanessa.', 'log250,snooze'])

// 15. quick action deep links from the manifest shortcuts
check('parses 250 shortcut', D.parseQuickAction('?action=log&ml=250'), { ml: 250 })
check('parses 500 shortcut', D.parseQuickAction('?action=log&ml=500'), { ml: 500 })
check('parses 150 without question mark', D.parseQuickAction('action=log&ml=150'), { ml: 150 })
check('rejects unlisted amount', D.parseQuickAction('?action=log&ml=4000'), null)
check('rejects tampered value', D.parseQuickAction('?action=log&ml=' + encodeURIComponent('250; drop table')), null)
check('rejects negative', D.parseQuickAction('?action=log&ml=-250'), null)
check('rejects other actions', D.parseQuickAction('?action=share&ml=250'), null)
check('rejects empty search', D.parseQuickAction(''), null)

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`)

function omit(obj, keys) {
  const clone = { ...obj }
  for (const key of keys) delete clone[key]
  return clone
}
function pick(m) {
  const { consumed, pct, remaining, cappedPct, sipsToday, metToday, atRisk } = m
  return { consumed, pct, remaining, cappedPct, sipsToday, metToday, atRisk }
}
function streakShape(m) {
  const { streak, bestStreak, plant } = m
  return { streak, bestStreak, level: plant.level, drooping: plant.drooping }
}
function bestOf(m) {
  const { streak, bestStreak } = m
  return { streak, bestStreak }
}
