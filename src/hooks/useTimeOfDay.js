const phaseForHour = (hour) => {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'night'
}

export function useTimeOfDay() {
  return phaseForHour(new Date().getHours())
}
