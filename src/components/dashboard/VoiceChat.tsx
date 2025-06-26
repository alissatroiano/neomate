import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
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
      // Don't auto-initialize, let user click to start
      setConnectionStatus('Ready to connect')
    }
    
    return () => {
      cleanup()
    }
  }, [isOpen])

  const initializeVoiceChat = async () => {
    try {
      setIsConnecting(true)
      setError(null)
      setConnectionStatus('Getting voice session...')

      console.log('Starting voice chat initialization...')

      // Get signed URL from our Supabase function
      const { signedUrl } = await getElevenLabsSignedUrl()
      console.log('Got signed URL, requesting microphone access...')
      
      setConnectionStatus('Requesting microphone access...')
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      })
      streamRef.current = stream
      console.log('Microphone access granted')

      setConnectionStatus('Connecting to voice service...')

      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 16000 })
      
      // Connect to ElevenLabs WebSocket
      console.log('Connecting to WebSocket:', signedUrl.substring(0, 50) + '...')
      const ws = new WebSocket(signedUrl)
      websocketRef.current = ws

      ws.onopen = () => {
        console.log('Connected to ElevenLabs voice chat')
        setIsConnected(true)
        setIsConnecting(false)
        setConnectionStatus('Connected - Voice chat active')
        startRecording()
      }

      ws.onmessage = (event) => {
        console.log('Received WebSocket message:', event.data instanceof Blob ? 'Audio blob' : event.data)
        
        // Handle incoming audio data
        if (event.data instanceof Blob) {
          playAudioBlob(event.data)
        } else {
          // Handle text messages (status updates, etc.)
          try {
            const message = JSON.parse(event.data)
            console.log('Received message:', message)
            
            if (message.type === 'conversation_initiation_metadata') {
              setConnectionStatus('Voice chat ready - Speak now!')
            } else if (message.type === 'user_transcript') {
              console.log('User said:', message.user_transcript)
            } else if (message.type === 'agent_response') {
              console.log('Agent responding...')
            }
          } catch (e) {
            console.log('Received non-JSON message:', event.data)
          }
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('Voice connection error occurred')
        setConnectionStatus('Connection error')
        setIsConnecting(false)
      }

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('Disconnected')
        if (event.code !== 1000) { // Not a normal closure
          setError(`Connection closed unexpectedly (${event.code})`)
        }
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
    if (!streamRef.current) {
      console.error('No stream available for recording')
      return
    }

    try {
      // Check if MediaRecorder supports the preferred format
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4'
        }
      }

      console.log('Starting recording with MIME type:', mimeType)

      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: mimeType
      })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && websocketRef.current?.readyState === WebSocket.OPEN && !isMuted) {
          console.log('Sending audio data:', event.data.size, 'bytes')
          websocketRef.current.send(event.data)
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setError('Recording error occurred')
      }

      mediaRecorder.start(250) // Send data every 250ms
      console.log('Started recording audio')
    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Failed to start recording: ' + error.message)
    }
  }

  const playAudioBlob = async (blob: Blob) => {
    try {
      if (!audioContextRef.current) {
        console.error('No audio context available')
        return
      }

      console.log('Playing audio blob:', blob.size, 'bytes')
      
      const arrayBuffer = await blob.arrayBuffer()
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
      
      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContextRef.current.destination)
      source.start()
      
      console.log('Audio playback started')
    } catch (error) {
      console.error('Error playing audio:', error)
      // Don't show error to user for audio playback issues
    }
  }

  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !newMutedState
      })
    }
    
    console.log('Microphone', newMutedState ? 'muted' : 'unmuted')
  }

  const endCall = () => {
    console.log('Ending voice chat')
    cleanup()
    onClose()
  }

  const cleanup = () => {
    console.log('Cleaning up voice chat resources')
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    if (websocketRef.current) {
      websocketRef.current.close(1000, 'User ended call')
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
    }

    // Reset refs
    mediaRecorderRef.current = null
    websocketRef.current = null
    streamRef.current = null
    audioContextRef.current = null

    setIsConnected(false)
    setIsConnecting(false)
    setConnectionStatus('Disconnected')
  }

  const retryConnection = () => {
    setError(null)
    initializeVoiceChat()
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
            <div className={`p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center transition-colors ${
              isConnected 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : isConnecting 
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
                : 'bg-gradient-to-r from-teal-500 to-cyan-600'
            }`}>
              {isConnecting ? (
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              ) : (
                <Volume2 className="h-10 w-10 text-white" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Voice Chat with Neomate</h3>
            <p className="text-sm text-gray-600">{connectionStatus}</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">Connection Error</p>
              </div>
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <button
                onClick={retryConnection}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm flex items-center space-x-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Connection Status */}
          {isConnecting && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
              <span className="text-gray-600">Setting up voice chat...</span>
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Voice chat is active!</strong> Speak naturally with Neomate. 
                The AI can hear you and will respond with voice.
              </p>
            </div>
          )}

          {!isConnected && !isConnecting && !error && (
            <div className="space-y-3">
              <p className="text-gray-600 text-sm">
                Start a voice conversation with Neomate for hands-free support during your NICU journey.
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