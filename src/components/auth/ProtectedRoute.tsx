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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
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