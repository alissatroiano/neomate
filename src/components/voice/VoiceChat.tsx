import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from 'lucide-react'
import { Conversation } from '@elevenlabs/react'

interface VoiceChatProps {
  isOpen: boolean
  onClose: () => void
  agentId: string
  onConversationEnd?: (summary: string) => void
}

export default function VoiceChat({ isOpen, onClose, agentId, onConversationEnd }: VoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [error, setError] = useState<string | null>(null)

  const handleStatusChange = (status: any) => {
    console.log('Voice chat status:', status)
    setConnectionStatus(status.status)
    setIsConnected(status.status === 'connected')
    
    if (status.status === 'connected') {
      setError(null)
    }
  }

  const handleModeChange = (mode: any) => {
    console.log('Voice chat mode:', mode)
    setIsListening(mode.mode === 'listening')
  }

  const handleError = (error: any) => {
    console.error('Voice chat error:', error)
    setError('Connection error. Please try again.')
    setConnectionStatus('disconnected')
    setIsConnected(false)
  }

  const handleEnd = () => {
    setIsConnected(false)
    setConnectionStatus('disconnected')
    setIsListening(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            {isConnected ? (
              <Volume2 className="h-10 w-10 text-white" />
            ) : (
              <Mic className="h-10 w-10 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Voice Chat with Neomate</h2>
          <p className="text-gray-600">
            {connectionStatus === 'connecting' && 'Connecting to your AI assistant...'}
            {connectionStatus === 'connected' && 'Connected! Start speaking when you see the listening indicator.'}
            {connectionStatus === 'disconnected' && 'Ready to connect with your compassionate AI assistant.'}
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {isConnected && (
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              isListening ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isListening ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium">
                {isListening ? 'Listening' : 'Speaking'}
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* ElevenLabs Conversation Component */}
        <div className="flex justify-center">
          {!isConnected ? (
            <Conversation
              agentId={agentId}
              onStatusChange={handleStatusChange}
              onModeChange={handleModeChange}
              onError={handleError}
              onEnd={handleEnd}
            >
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Start Voice Chat</span>
              </button>
            </Conversation>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                {isListening ? (
                  <Mic className="h-12 w-12 text-white animate-pulse" />
                ) : (
                  <Volume2 className="h-12 w-12 text-white" />
                )}
              </div>
              <p className="text-gray-600">
                {isListening ? 'Listening to you...' : 'AI is speaking...'}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {isConnected && (
            <Conversation
              agentId={agentId}
              onStatusChange={handleStatusChange}
              onModeChange={handleModeChange}
              onError={handleError}
              onEnd={handleEnd}
            >
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <PhoneOff className="h-5 w-5" />
                <span>End Call</span>
              </button>
            </Conversation>
          )}
          
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How to use voice chat:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click "Start Voice Chat" to begin</li>
            <li>• Speak naturally when you see the listening indicator</li>
            <li>• The AI will respond with a caring, empathetic voice</li>
            <li>• Click "End Call" when you're finished</li>
          </ul>
        </div>
      </div>
    </div>
  )
}