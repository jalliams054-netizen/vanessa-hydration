import { useEffect } from 'react'

export function usePhaseChrome(tone) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', tone.meta)
    document.documentElement.style.colorScheme = tone.scheme
  }, [tone])
}
