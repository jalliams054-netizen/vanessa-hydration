const ALLOWED_ML = [150, 250, 500]

export function parseQuickAction(search = '') {
  const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`)
  if (params.get('action') !== 'log') return null
  const ml = Number(params.get('ml'))
  if (!ALLOWED_ML.includes(ml)) return null
  return { ml }
}
