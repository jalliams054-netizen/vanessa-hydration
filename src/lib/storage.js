export const STORAGE_KEYS = {
  state: 'vanessa-hydra:state:v1',
  celebrated: 'vanessa-hydra:celebrated:v1',
  reminders: 'vanessa-hydra:reminders:v1',
}

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed = JSON.parse(raw)
    return parsed === null || parsed === undefined ? fallback : parsed
  } catch {
    return fallback
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
