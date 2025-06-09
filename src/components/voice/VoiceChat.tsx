import React, { useState, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from 'lucide-react'
//import { useConversation } from '@elevenlabs/react'

interface VoiceChatProps {
  isOpen: boolean
  onClose: () => void
  agentId: string
  onConversationEnd?: (summary: string) => void
}

export default function VoiceChat({ isOpen, onClose, agentId, onConversationEnd }: VoiceChatProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const conversation = useConversation({
    onConnect: () => {
      console.log('Voice chat connected')
      setError(null)
    },
    onDisconnect: () => {
      console.log('Voice chat disconnected')
      setSignedUrl(null)
    },
    onMessage: (message) => {
      console.log('Voice chat message:', message)
    },
    onError: (error) => {
      console.error('Voice chat error:', error)
      setError('Connection error. Please try again.')
    }
  })

  // Get signed URL from our server function
  useEffect(() => {
    if (isOpen && agentId && !signedUrl) {
      fetchSignedUrl()
    }
  }, [isOpen, agentId])

  const fetchSignedUrl = async () => {
    try {
      setIsConnecting(true)
      setError(null)
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const response = await fetch(
        `${supabaseUrl}/functions/v1/elevenlabs-auth?agent_id=${agentId}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to get signed URL')
      }

      const data = await response.json()
      setSignedUrl(data.signed_url)
    } catch (error) {
      console.error('Error fetching signed URL:', error)
      setError('Failed to connect to voice service. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const startConversation = async () => {
    if (!signedUrl) return

    try {
      // Request microphone access first
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Start the conversation session
      await conversation.startSession({ url: signedUrl })
    } catch (error) {
      console.error('Error starting conversation:', error)
      setError('Failed to start voice chat. Please check microphone permissions.')
    }
  }

  const endConversation = async () => {
    try {
      await conversation.endSession()
      onClose()
    } catch (error) {
      console.error('Error ending conversation:', error)
      onClose()
    }
  }

  const handleClose = () => {
    if (conversation.status === 'connected') {
      endConversation()
    } else {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            {conversation.status === 'connected' ? (
              <Volume2 className="h-10 w-10 text-white" />
            ) : (
              <Mic className="h-10 w-10 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Voice Chat with Neomate</h2>
          <p className="text-gray-600">
            {isConnecting && 'Preparing voice chat...'}
            {!isConnecting && conversation.status === 'disconnected' && signedUrl && 'Ready to start your voice conversation.'}
            {conversation.status === 'connected' && 'Connected! Speak naturally with your AI assistant.'}
            {!signedUrl && !isConnecting && 'Setting up voice chat...'}
          </p>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center space-x-4">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            conversation.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              conversation.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm font-medium">
              {conversation.status === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {conversation.status === 'connected' && (
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              conversation.isSpeaking ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                conversation.isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium">
                {conversation.isSpeaking ? 'AI Speaking' : 'Listening'}
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

        {/* Main Content */}
        <div className="flex justify-center">
          {isConnecting ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600">Preparing voice chat...</p>
            </div>
          ) : conversation.status === 'disconnected' && signedUrl ? (
            <button
              onClick={startConversation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <Phone className="h-5 w-5" />
              <span>Start Voice Chat</span>
            </button>
          ) : conversation.status === 'connected' ? (
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                {conversation.isSpeaking ? (
                  <Volume2 className="h-12 w-12 text-white animate-pulse" />
                ) : (
                  <Mic className="h-12 w-12 text-white animate-pulse" />
                )}
              </div>
              <p className="text-gray-600">
                {conversation.isSpeaking ? 'AI is speaking...' : 'Listening to you...'}
              </p>
            </div>
          ) : null}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {conversation.status === 'connected' && (
            <button
              onClick={endConversation}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <PhoneOff className="h-5 w-5" />
              <span>End Call</span>
            </button>
          )}
          
          <button
            onClick={handleClose}
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
            <li>• Allow microphone access when prompted</li>
            <li>• Speak naturally - the AI will respond with empathy</li>
            <li>• Click "End Call" when you're finished</li>
          </ul>
        </div>
      </div>
    </div>
  )
}