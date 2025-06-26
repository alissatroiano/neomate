import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, AlertCircle, Loader2 } from 'lucide-react'
import { getElevenLabsSignedUrl, isElevenLabsConfigured } from '../../lib/elevenlabs'

interface VoiceChatProps {
  isOpen: boolean
  onClose: () => void
}

export default function VoiceChat({ isOpen, onClose }: VoiceChatProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected')
  
  const websocketRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen && isElevenLabsConfigured()) {
      initializeVoiceChat()
    }
    
    return () => {
      cleanup()
    }
  }, [isOpen])

  const initializeVoiceChat = async () => {
    try {
      setIsConnecting(true)
      setError(null)
      setConnectionStatus('Connecting...')

      // Get signed URL from our Supabase function
      const { signedUrl } = await getElevenLabsSignedUrl()
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      streamRef.current = stream

      // Initialize audio context
      audioContextRef.current = new AudioContext()
      
      // Connect to ElevenLabs WebSocket
      const ws = new WebSocket(signedUrl)
      websocketRef.current = ws

      ws.onopen = () => {
        console.log('Connected to ElevenLabs voice chat')
        setIsConnected(true)
        setIsConnecting(false)
        setConnectionStatus('Connected')
        startRecording()
      }

      ws.onmessage = (event) => {
        // Handle incoming audio data
        if (event.data instanceof Blob) {
          playAudioBlob(event.data)
        } else {
          // Handle text messages (status updates, etc.)
          try {
            const message = JSON.parse(event.data)
            console.log('Received message:', message)
            
            if (message.type === 'conversation_initiation_metadata') {
              setConnectionStatus('Voice chat ready')
            }
          } catch (e) {
            console.log('Received non-JSON message:', event.data)
          }
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('Connection error occurred')
        setConnectionStatus('Connection error')
      }

      ws.onclose = () => {
        console.log('WebSocket connection closed')
        setIsConnected(false)
        setConnectionStatus('Disconnected')
        cleanup()
      }

    } catch (error: any) {
      console.error('Error initializing voice chat:', error)
      setError(error.message || 'Failed to initialize voice chat')
      setIsConnecting(false)
      setConnectionStatus('Failed to connect')
    }
  }

  const startRecording = () => {
    if (!streamRef.current) return

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && websocketRef.current?.readyState === WebSocket.OPEN && !isMuted) {
          websocketRef.current.send(event.data)
        }
      }

      mediaRecorder.start(100) // Send data every 100ms
      console.log('Started recording audio')
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Failed to start recording')
    }
  }

  const playAudioBlob = async (blob: Blob) => {
    try {
      if (!audioContextRef.current) return

      const arrayBuffer = await blob.arrayBuffer()
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
      
      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)
      source.start()
    } catch (error) {
      console.error('Error playing audio:', error)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted // Will be opposite after state update
      })
    }
  }

  const endCall = () => {
    cleanup()
    onClose()
  }

  const cleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    if (websocketRef.current) {
      websocketRef.current.close()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }

    setIsConnected(false)
    setIsConnecting(false)
    setConnectionStatus('Disconnected')
  }

  if (!isOpen) return null

  if (!isElevenLabsConfigured()) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            <h3 className="text-lg font-semibold">Voice Chat Unavailable</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Voice chat is not configured. Please contact support to enable this feature.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              <Volume2 className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Voice Chat with Neomate</h3>
            <p className="text-sm text-gray-600">{connectionStatus}</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Connection Status */}
          {isConnecting && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
              <span className="text-gray-600">Connecting to voice chat...</span>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {isConnected && (
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition-colors ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>
            )}
            
            <button
              onClick={endCall}
              className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors"
              title="End call"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
          </div>

          {/* Instructions */}
          {isConnected && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-sm text-teal-800">
                <strong>Voice chat is active!</strong> Speak naturally with Neomate. 
                The AI can hear you and will respond with voice.
              </p>
            </div>
          )}

          {!isConnected && !isConnecting && !error && (
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                Start a voice conversation with Neomate for hands-free support.
              </p>
              <button
                onClick={initializeVoiceChat}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 px-6 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 flex items-center space-x-2 mx-auto"
              >
                <Phone className="h-5 w-5" />
                <span>Start Voice Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}