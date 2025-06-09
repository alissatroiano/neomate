import { createContext, useContext, ReactNode } from 'react'
'use client';

interface VoiceContextType {
  stability: number;
  similarity_boost: number;
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
  stability?: number
}


export function VoiceProvider({ children, stability = 0.5 }: VoiceProviderProps) {
  const value: VoiceContextType = {
    stability,
    similarity_boost: 0.5, // You can adjust the default value as needed
  }

  return (
      <VoiceContext.Provider value={value}>
        {children}
      </VoiceContext.Provider>
  )
}