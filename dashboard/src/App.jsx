import { Routes, Route } from 'react-router-dom'
import TopNav from './components/TopNav'
import Dashboard from './pages/Dashboard'
import Timeline from './pages/Timeline'
import Sessions from './pages/Sessions'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

function App() {
  return (
    <div className="app-container">
      <TopNav />
      <div className="main-content">
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
