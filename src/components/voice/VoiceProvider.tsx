import React, { createContext, useContext, ReactNode } from 'react'
// import { ElevenLabsProvider } from '@elevenlabs/react'

interface VoiceContextType {
  // Add any voice-related state or methods here
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined)

export function useVoice() {
  const context = useContext(VoiceContext)
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider')
  }
  return context
}

interface VoiceProviderProps {
  children: ReactNode
  apiKey: string
}

export function VoiceProvider({ children, apiKey }: VoiceProviderProps) {
  const value = {
    // Add voice-related state and methods here
  }

  return (
    <ElevenLabsProvider apiKey={apiKey}>
      <VoiceContext.Provider value={value}>
        {children}
      </VoiceContext.Provider>
    </ElevenLabsProvider>
  )
}