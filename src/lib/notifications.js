export const SASSY_MESSAGES = [
  { body: "Vanessa, your plant literally brought a cup. Drink it." },
  { body: "Hydrate, Vanessa. I'm not a drama queen, you are." },
  { body: "Vanessa, that water is right there. It's not gonna flee the country." },
  { body: "A sip for Vanessa, a giant leap for her kidney stones." },
  { body: "Vanessa, be a mermaid. Mermaids drink water. It's the whole brand." },
  { body: "Your plant is side-eyeing you, Vanessa." },
  { body: "Vanessa, water is free. This is the cheapest glow-up available." },
  { body: "Drink up, Vanessa. Dehydrated you argues worse with people." },
  { body: "Vanessa, I've seen you text faster than you sip. Prove me wrong." },
  { body: "Hydration check, Vanessa. Even your cactus has a routine." },
  { body: "Vanessa, that 250 ml is basically a shot glass for grown-ups." },
  { body: "Water, Vanessa. It's the only thing here that won't ghost you." },
  { body: "Vanessa, do it for the skin. Do it for the plant. Do it for me." },
  { body: "Reminder: Vanessa cannot run on iced latte alone. Science says so." },
  { body: "Vanessa, two litres or I start calling you 'dusty'." },
]

export const REMINDER_TITLE = 'Vanessa 👀'
export const REMINDER_TAG = 'vanessa-hydra-reminder'

export const REMINDER_CONFIG = {
  quietEndHour: 9,
  firstHour: 9,
  quietStartHour: 21,
  maxPerDay: 4,
  minGapMs: 45 * 60 * 1000,
  tickMs: 60 * 1000,
}

export function isQuietHour(hour, config = REMINDER_CONFIG) {
  return hour >= config.quietStartHour || hour < config.quietEndHour
}

export function pickMessage(lastIndex, messages = SASSY_MESSAGES) {
  if (messages.length === 0) return null
  if (messages.length === 1) return { index: 0, ...messages[0] }
  let index = Math.floor(Math.random() * messages.length)
  if (index === lastIndex) index = (index + 1) % messages.length
  return { index, ...messages[index] }
}

export async function displayNotification(registration, message) {
  const options = notificationOptions(message)
  if (registration?.showNotification) {
    await registration.showNotification(REMINDER_TITLE, options)
    return true
  }
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(REMINDER_TITLE, options)
    return true
  }
  return false
}

export function shouldRemind({
  hour,
  now,
  lastAt,
  metToday,
  countToday,
  enabled,
  config = REMINDER_CONFIG,
}) {
  if (!enabled || metToday) return false
  if (isQuietHour(hour, config)) return false
  if (hour < config.firstHour) return false
  if (countToday >= config.maxPerDay) return false
  if (lastAt != null && now - lastAt < config.minGapMs) return false
  return true
}

export function notificationOptions(message) {
  return {
    tag: REMINDER_TAG,
    title: REMINDER_TITLE,
    body: message.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    lang: 'en',
    requireInteraction: false,
    actions: [
      { action: 'log250', title: '+250 ml' },
      { action: 'snooze', title: 'Later' },
    ],
  }
}
