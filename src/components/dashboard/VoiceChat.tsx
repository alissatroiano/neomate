import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, AlertCircle, Loader2, RefreshCw, Settings } from 'lucide-react'
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
  const [connectionStatus, setConnectionStatus] = useState<string>('Ready to connect')
  
  const websocketRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (isElevenLabsConfigured()) {
        setConnectionStatus('Ready to connect')
        setError(null)
      } else {
        setError('Voice chat is not properly configured')
        setConnectionStatus('Configuration required')
      }
    }
    
    return () => {
      cleanup()
    }
  }, [isOpen])

  const initializeVoiceChat = async () => {
    try {
      setIsConnecting(true)
      setError(null)
      setConnectionStatus('Checking configuration...')

      console.log('Starting voice chat initialization...')

      // Check configuration first
      if (!isElevenLabsConfigured()) {
        throw new Error('Voice chat is not properly configured. Please check your environment settings.')
      }

      setConnectionStatus('Getting voice session...')

      // Get signed URL from our Supabase function
      const { signedUrl } = await getElevenLabsSignedUrl()
      console.log('Got signed URL, requesting microphone access...')
      
      setConnectionStatus('Requesting microphone access...')
      
      // Request microphone access with specific constraints for ElevenLabs
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 16000,
            channelCount: 1
          } 
        })
      } catch (micError: any) {
        console.error('Microphone access error:', micError)
        if (micError.name === 'NotAllowedError') {
          throw new Error('Microphone access denied. Please allow microphone access and try again.')
        } else if (micError.name === 'NotFoundError') {
          throw new Error('No microphone found. Please connect a microphone and try again.')
        } else {
          throw new Error('Failed to access microphone: ' + micError.message)
        }
      }
      
      streamRef.current = stream
      console.log('Microphone access granted')

      setConnectionStatus('Connecting to voice service...')

      // Initialize audio context with 16kHz sample rate for ElevenLabs
      try {
        audioContextRef.current = new AudioContext({ sampleRate: 16000 })
        
        // Resume audio context if it's suspended
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume()
        }
      } catch (audioError: any) {
        console.error('Audio context error:', audioError)
        throw new Error('Failed to initialize audio: ' + audioError.message)
      }
      
      // Connect to ElevenLabs WebSocket
      console.log('Connecting to WebSocket:', signedUrl.substring(0, 50) + '...')
      const ws = new WebSocket(signedUrl)
      websocketRef.current = ws

      // Set up WebSocket event handlers
      ws.onopen = () => {
        console.log('Connected to ElevenLabs voice chat')
        setIsConnected(true)
        setIsConnecting(false)
        setConnectionStatus('Connected - Voice chat active')
        startAudioProcessing()
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
              setConnectionStatus('Neomate is speaking...')
            } else if (message.type === 'agent_response_complete') {
              setConnectionStatus('Voice chat ready - Speak now!')
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
        if (event.code === 1008) {
          setError('Audio format error - please try again')
        } else if (event.code !== 1000) {
          setError(`Connection closed unexpectedly (Code: ${event.code})`)
        }
        cleanup()
      }

      // Set a timeout for connection
      setTimeout(() => {
        if (isConnecting && !isConnected) {
          console.log('Connection timeout')
          setError('Connection timeout. Please try again.')
          setIsConnecting(false)
          cleanup()
        }
      }, 30000) // 30 second timeout

    } catch (error: any) {
      console.error('Error initializing voice chat:', error)
      setError(error.message || 'Failed to initialize voice chat')
      setIsConnecting(false)
      setConnectionStatus('Failed to connect')
      cleanup()
    }
  }

  const startAudioProcessing = () => {
    if (!streamRef.current || !audioContextRef.current) {
      console.error('No stream or audio context available for processing')
      return
    }

    try {
      console.log('Starting audio processing for ElevenLabs PCM format')

      // Create audio source from microphone stream
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current)
      sourceRef.current = source

      // Create script processor for real-time audio processing
      // Use 4096 buffer size for better performance
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (event) => {
        if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN || isMuted) {
          return
        }

        const inputBuffer = event.inputBuffer
        const inputData = inputBuffer.getChannelData(0) // Get mono channel

        // Convert Float32Array to Int16Array (PCM 16-bit)
        const pcmData = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          // Convert from [-1, 1] to [-32768, 32767]
          const sample = Math.max(-1, Math.min(1, inputData[i]))
          pcmData[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
        }

        // Send PCM data as binary
        if (pcmData.length > 0) {
          console.log('Sending PCM audio data:', pcmData.length, 'samples')
          websocketRef.current.send(pcmData.buffer)
        }
      }

      // Connect the audio processing chain
      source.connect(processor)
      processor.connect(audioContextRef.current.destination)

      console.log('Audio processing started - sending PCM data to ElevenLabs')
    } catch (error: any) {
      console.error('Error starting audio processing:', error)
      setError('Failed to start audio processing: ' + error.message)
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
    setConnectionStatus(newMutedState ? 'Microphone muted' : 'Voice chat ready - Speak now!')
  }

  const endCall = () => {
    console.log('Ending voice chat')
    cleanup()
    onClose()
  }

  const cleanup = () => {
    console.log('Cleaning up voice chat resources')
    
    // Disconnect audio processing chain
    if (processorRef.current) {
      try {
        processorRef.current.disconnect()
      } catch (e) {
        console.log('Error disconnecting processor:', e)
      }
    }
    
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect()
      } catch (e) {
        console.log('Error disconnecting source:', e)
      }
    }
    
    if (websocketRef.current) {
      try {
        websocketRef.current.close(1000, 'User ended call')
      } catch (e) {
        console.log('Error closing websocket:', e)
      }
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop()
        } catch (e) {
          console.log('Error stopping track:', e)
        }
      })
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close()
      } catch (e) {
        console.log('Error closing audio context:', e)
      }
    }

    // Reset refs
    processorRef.current = null
    sourceRef.current = null
    websocketRef.current = null
    streamRef.current = null
    audioContextRef.current = null

    setIsConnected(false)
    setIsConnecting(false)
    setIsMuted(false)
    setConnectionStatus('Disconnected')
  }

  const retryConnection = () => {
    setError(null)
    cleanup()
    setTimeout(() => {
      initializeVoiceChat()
    }, 1000)
  }

  if (!isOpen) return null

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
                : error
                ? 'bg-gradient-to-r from-red-500 to-red-600'
                : 'bg-gradient-to-r from-teal-500 to-cyan-600'
            }`}>
              {isConnecting ? (
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              ) : error ? (
                <AlertCircle className="h-10 w-10 text-white" />
              ) : isConnected ? (
                isMuted ? <VolumeX className="h-10 w-10 text-white" /> : <Volume2 className="h-10 w-10 text-white" />
              ) : (
                <Phone className="h-10 w-10 text-white" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Voice Chat with Neomate</h3>
            <p className="text-sm text-gray-600">{connectionStatus}</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700 font-medium">Connection Error</p>
              </div>
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <div className="flex space-x-2 justify-center">
                <button
                  onClick={retryConnection}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Retry</span>
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                >
                  Close
                </button>
              </div>
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

          {/* Configuration Info */}
          {!isElevenLabsConfigured() && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="h-5 w-5 text-amber-600" />
                <p className="text-sm text-amber-800 font-medium">Configuration Required</p>
              </div>
              <p className="text-sm text-amber-700">
                Voice chat requires proper Supabase and ElevenLabs configuration. 
                Please contact support to enable this feature.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}