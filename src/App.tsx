import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { VoiceProvider } from './components/voice/VoiceProvider'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Dashboard from './components/dashboard/Dashboard'
import LandingPage from './components/LandingPage'

// Get ElevenLabs API key from environment variables with fallback
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || ''

function App() {
  return (
    <AuthProvider>
      <VoiceProvider apiKey={ELEVENLABS_API_KEY}>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </VoiceProvider>
    </AuthProvider>
  )
}

export default App