import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import AuthForm from './AuthForm'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/neomate_logo.png" 
              alt="Neomate" 
              className="h-10 w-10"
            />
            <div className="flex flex-col">
              <span className="text-3xl font-script text-teal-600">Neomate</span>
              <span className="text-xs text-teal-500 uppercase tracking-wider font-light -mt-1">
                Neonatal AI Assistant
              </span>
            </div>
          </div>
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return <>{children}</>
}

function AuthPage() {
  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin')

  const handleSuccess = () => {
    // This will be handled by the auth context automatically
    console.log('Authentication successful')
  }

  return (
    <AuthForm
      mode={mode}
      onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      onSuccess={handleSuccess}
    />
  )
}