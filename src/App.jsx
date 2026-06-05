import { useState } from 'react'
import Lock from './screens/Lock.jsx'
import Home from './screens/Home.jsx'
import Behavior from './screens/Behavior.jsx'
import Album from './screens/Album.jsx'
import Letters from './screens/Letters.jsx'
import Settings from './screens/Settings.jsx'
import JournalHistory from './screens/JournalHistory.jsx'
import { ToastProvider } from './ui.jsx'
import Icon from './Icon.jsx'

const TABS = [
  { id: 'home', label: 'Today', icon: 'home' },
  { id: 'behavior', label: 'Behavior', icon: 'smile' },
  { id: 'album', label: 'Album', icon: 'image' },
  { id: 'letters', label: 'Letters', icon: 'mail' }
]

export default function App() {
  const [unlocked, setUnlocked] = useState(() => !!sessionStorage.getItem('hoh_unlocked'))
  const [view, setView] = useState('home')
  const [params, setParams] = useState(null)

  function unlock() {
    sessionStorage.setItem('hoh_unlocked', '1')
    setUnlocked(true)
  }
  function lock() {
    sessionStorage.removeItem('hoh_unlocked')
    setUnlocked(false)
    setView('home')
  }
  function go(v, p = null) { setParams(p); setView(v) }

  if (!unlocked) return <Lock onUnlock={unlock} />

  const navView = TABS.some((t) => t.id === view) ? view : null

  return (
    <ToastProvider>
      <div className="app">
        {view === 'home' && <Home key="home" go={go} />}
        {view === 'behavior' && <Behavior key="behavior" />}
        {view === 'album' && <Album key="album" params={params} />}
        {view === 'letters' && <Letters key="letters" />}
        {view === 'settings' && <Settings key="settings" onLock={lock} go={go} />}
        {view === 'journal' && <JournalHistory key="journal" go={go} />}

        <nav className="navbar">
          {TABS.map((t) => (
            <button key={t.id} className={'navitem' + (navView === t.id ? ' active' : '')} onClick={() => go(t.id)} aria-label={t.label}>
              <Icon name={t.icon} size={21} stroke={navView === t.id ? 2.2 : 2} />
              <span className="lbl">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </ToastProvider>
  )
}
