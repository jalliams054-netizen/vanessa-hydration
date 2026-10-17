import { motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import AppHeader from './components/AppHeader.jsx'
import BottomNav from './components/BottomNav.jsx'
import DropletBurst from './components/DropletBurst.jsx'
import SkyBackground from './components/SkyBackground.jsx'
import HomeView from './views/HomeView.jsx'
import PlantView from './views/PlantView.jsx'
import SettingsView from './views/SettingsView.jsx'
import { useGoalCelebration } from './hooks/useGoalCelebration.js'
import { useHydration } from './hooks/useHydration.js'
import { usePhaseChrome } from './hooks/usePhaseChrome.js'
import { useQuickActionLog } from './hooks/useQuickActionLog.js'
import { useReminders } from './hooks/useReminders.js'
import { useTimeOfDay } from './hooks/useTimeOfDay.js'
import { themeFor } from './styles/theme.js'

export default function App() {
  const phase = useTimeOfDay()
  const tone = themeFor(phase)
  const water = useHydration()
  const burst = useGoalCelebration(water.metToday, water.today)
  const reminders = useReminders({ metToday: water.metToday })
  const [tab, setTab] = useState('home')

  usePhaseChrome(tone)

  const { log } = water
  const quickLog = useCallback(
    (ml) => {
      log(ml)
      setTab('home')
    },
    [log],
  )
  useQuickActionLog(quickLog)

  const view =
    tab === 'plant' ? (
      <PlantView tone={tone} water={water} />
    ) : tab === 'settings' ? (
      <SettingsView tone={tone} water={water} reminders={reminders} />
    ) : (
      <HomeView tone={tone} water={water} onEditGoal={() => setTab('settings')} />
    )

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden">
      <SkyBackground tone={tone} phase={phase} />
      <DropletBurst trigger={burst} tone={tone} />

      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col">
        <div className="mx-auto w-full max-w-md shrink-0 px-5 pb-3 pt-6">
          <AppHeader tone={tone} phase={phase} />
        </div>

        <main
          className="no-scrollbar mx-auto min-h-0 w-full max-w-md flex-1 overflow-y-auto overscroll-contain px-5 pb-6"
          aria-label={`${tab} view`}
        >
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {view}
          </motion.div>
        </main>

        <BottomNav tone={tone} active={tab} onSelect={setTab} />
      </div>
    </div>
  )
}
