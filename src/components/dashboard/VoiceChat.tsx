import React, { useEffect, useRef } from 'react'
import { X, Mic, AlertCircle, Settings } from 'lucide-react'

interface VoiceChatProps {
  isOpen: boolean
  onClose: () => void
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': {
        'agent-id': string
        style?: React.CSSProperties
      }
    }
  }
}

export default function VoiceChat({ isOpen, onClose }: VoiceChatProps) {
  const widgetContainerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)

  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_01jxascan4fg6anwxndmze5jp1'

  useEffect(() => {
    if (isOpen && !scriptLoadedRef.current) {
      loadElevenLabsScript()
    }
  }, [isOpen])

  const loadElevenLabsScript = () => {
    // Check if script is already loaded
    if (document.querySelector('script[src*="convai-widget-embed"]')) {
      scriptLoadedRef.current = true
      return
    }

    console.log('Loading ElevenLabs widget script...')
    
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed'
    script.async = true
    script.type = 'text/javascript'
    
    script.onload = () => {
      console.log('ElevenLabs widget script loaded successfully')
      scriptLoadedRef.current = true
    }
    
    script.onerror = () => {
      console.error('Failed to load ElevenLabs widget script')
    }
    
    document.head.appendChild(script)
  }

  const isElevenLabsConfigured = () => {
    return agentId && agentId !== 'your-agent-id-here' && agentId.startsWith('agent_')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md mx-4 w-full relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-2 rounded-full">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Voice Chat with Neomate</h3>
              <p className="text-sm text-gray-600">Speak naturally for hands-free support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Widget Container */}
        <div className="p-6">
          {isElevenLabsConfigured() ? (
            <div ref={widgetContainerRef} className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Mic className="h-5 w-5 text-purple-600" />
                  <p className="text-sm text-purple-800 font-medium">Voice Chat Ready</p>
                </div>
                <p className="text-sm text-purple-700">
                  Click the microphone button below to start speaking with Neomate. 
                  The AI will respond with voice for a natural conversation experience.
                </p>
              </div>

              {/* ElevenLabs Widget */}
              <div className="flex justify-center">
                <elevenlabs-convai 
                  agent-id={agentId}
                  style={{
                    width: '100%',
                    height: '400px',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600 text-center">
                  <strong>Tips:</strong> Speak clearly and naturally. You can ask about NICU procedures, 
                  share your feelings, or request emotional support. Neomate is here to listen and help.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-amber-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Voice Chat Unavailable</h4>
                <p className="text-gray-600 mb-4">
                  Voice chat requires proper configuration. Please contact support to enable this feature.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <Settings className="h-4 w-4 text-amber-600" />
                    <p className="text-sm text-amber-800 font-medium">Configuration Required</p>
                  </div>
                  <p className="text-sm text-amber-700">
                    Voice chat needs an ElevenLabs agent ID to be configured. 
                    This feature will be available once properly set up.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors"
          >
            Close Voice Chat
          </button>
        </div>
      </div>
    </div>
  )
}