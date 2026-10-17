export async function currentRegistration() {
  try {
    return (await navigator.serviceWorker?.getRegistration?.()) ?? null
  } catch {
    return null
  }
}
