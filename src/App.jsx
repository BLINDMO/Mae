import { useEffect, useState } from 'react'
import Splash from './screens/Splash.jsx'
import Lock from './screens/Lock.jsx'
import Home from './screens/Home.jsx'
import Behavior from './screens/Behavior.jsx'
import Album from './screens/Album.jsx'
import Letters from './screens/Letters.jsx'
import Settings from './screens/Settings.jsx'
import { ToastProvider } from './ui.jsx'

const TABS = [
  { id: 'home', label: 'Today', icon: '🏡' },
  { id: 'behavior', label: 'Behavior', icon: '😊' },
  { id: 'album', label: 'Album', icon: '📸' },
  { id: 'letters', label: 'Letters', icon: '💌' }
]

export default function App() {
  const [phase, setPhase] = useState('splash')
  const [tab, setTab] = useState('home')
  const [params, setParams] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase(sessionStorage.getItem('hoh_unlocked') ? 'app' : 'locked')
    }, 2100)
    return () => clearTimeout(t)
  }, [])

  function unlock() {
    sessionStorage.setItem('hoh_unlocked', '1')
    setPhase('app')
  }
  function lock() {
    sessionStorage.removeItem('hoh_unlocked')
    setPhase('locked')
    setTab('home')
  }

  function go(screen, p = null) { setParams(p); setTab(screen) }

  if (phase === 'splash') return <Splash />
  if (phase === 'locked') return <Lock onUnlock={unlock} />

  return (
    <ToastProvider>
      <div className="app">
        <div className="app-header">
          <img className="logo-sm" src="logo.svg" alt="" />
          <div className="title">
            <h1>History of Honeycutt's</h1>
            <span>Our family story, one day at a time</span>
          </div>
          <button className="icon-btn" onClick={() => go('settings')} aria-label="Settings">⚙️</button>
        </div>

        {tab === 'home' && <Home key="home" go={go} />}
        {tab === 'behavior' && <Behavior key="behavior" />}
        {tab === 'album' && <Album key="album" params={params} />}
        {tab === 'letters' && <Letters key="letters" />}
        {tab === 'settings' && <Settings key="settings" onLock={lock} />}

        <nav className="tabbar">
          {TABS.map((t) => (
            <button key={t.id} className={'tab' + (tab === t.id ? ' active' : '')} onClick={() => go(t.id)}>
              <span className="ti">{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
      </div>
    </ToastProvider>
  )
}
