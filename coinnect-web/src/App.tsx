import './App.css'
import { BrowserRouter, Link, Route, Routes, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Roundup from './pages/Roundup'
import Chatbot from './pages/Chatbot'
import Leaderboard from './pages/Leaderboard'
import Goals from './pages/Goals'
import { useEffect, useState } from 'react'
import { getMe, login, setAuthToken } from './lib/api'

export default function App() {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        // Auto-login with demo account for prototype flow
        const { token } = await login('alice@student.edu', 'password123')
        setAuthToken(token)
        setAuthed(true)
        await getMe()
      } catch (e) {
        setAuthed(false)
      }
    })()
  }, [])

  if (!authed) return <div className="p-6">Loading...</div>

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <nav className="px-6 py-3 bg-white border-b flex gap-4">
          <Link to="/">Dashboard</Link>
          <Link to="/roundup">Round-up</Link>
          <Link to="/chat">AI Coach</Link>
          <Link to="/goals">Goals</Link>
          <Link to="/leaderboard">Leaderboard</Link>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/roundup" element={<Roundup />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
