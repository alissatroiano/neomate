import React from 'react'
import { AlertCircle, Database, Key, Mic, CheckCircle, ExternalLink } from 'lucide-react'

interface LocalDevSetupProps {
  onClose: () => void
}

export default function LocalDevSetup({ onClose }: LocalDevSetupProps) {
  // Only show setup guide in development mode
  if (import.meta.env.MODE === 'production') {
    return null
  }

  const envVars = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    openaiKey: import.meta.env.OPENAI_API_KEY,
    elevenLabsAgent: import.meta.env.VITE_ELEVENLABS_AGENT_ID
  }

  const isSupabaseConfigured = envVars.supabaseUrl && 
                               envVars.supabaseKey && 
                               !envVars.supabaseUrl.includes('placeholder') &&
                               envVars.supabaseUrl !== 'your_supabase_project_url_here'

  const isOpenAIConfigured = envVars.openaiKey && 
                            envVars.openaiKey !== 'your_openai_api_key_here'

  const isElevenLabsConfigured = envVars.elevenLabsAgent && 
                                envVars.elevenLabsAgent !== 'your_elevenlabs_agent_id_here' &&
                                envVars.elevenLabsAgent.startsWith('agent_')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Local Development Setup</h2>
              <p className="text-sm text-gray-600">Configure your environment variables</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Environment Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Environment Status</h3>
            
            {/* Supabase */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Supabase Database</p>
                  <p className="text-sm text-gray-600">Required for chat functionality</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isSupabaseConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${isSupabaseConfigured ? 'text-green-600' : 'text-red-600'}`}>
                  {isSupabaseConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            </div>

            {/* OpenAI */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Key className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">OpenAI API</p>
                  <p className="text-sm text-gray-600">Required for AI responses</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isOpenAIConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${isOpenAIConfigured ? 'text-green-600' : 'text-red-600'}`}>
                  {isOpenAIConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            </div>

            {/* ElevenLabs */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Mic className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">ElevenLabs Voice</p>
                  <p className="text-sm text-gray-600">Optional for voice chat</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isElevenLabsConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <span className={`text-sm font-medium ${isElevenLabsConfigured ? 'text-green-600' : 'text-amber-600'}`}>
                  {isElevenLabsConfigured ? 'Configured' : 'Optional'}
                </span>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Setup Instructions</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">1. Create .env file</h4>
                <p className="text-sm text-gray-600">
                  Create a <code className="bg-gray-200 px-1 rounded">.env</code> file in your project root with these variables:
                </p>
                <div className="bg-gray-800 text-green-400 p-3 rounded text-sm font-mono overflow-x-auto">
                  <div>VITE_SUPABASE_URL=your_supabase_project_url</div>
                  <div>VITE_SUPABASE_ANON_KEY=your_supabase_anon_key</div>
                  <div>OPENAI_API_KEY=your_openai_api_key</div>
                  <div>VITE_ELEVENLABS_AGENT_ID=your_agent_id</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">2. Get Supabase Credentials</h4>
                <p className="text-sm text-gray-600">
                  Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                    Supabase Dashboard <ExternalLink className="h-3 w-3 ml-1" />
                  </a> and copy:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside ml-4">
                  <li>Project URL (Settings → API)</li>
                  <li>Anon/Public Key (Settings → API)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">3. Get OpenAI API Key</h4>
                <p className="text-sm text-gray-600">
                  Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                    OpenAI API Keys <ExternalLink className="h-3 w-3 ml-1" />
                  </a> to create an API key.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">4. Restart Development Server</h4>
                <p className="text-sm text-gray-600">
                  After updating your .env file, restart your dev server:
                </p>
                <div className="bg-gray-800 text-green-400 p-2 rounded text-sm font-mono">
                  npm run dev
                </div>
              </div>
            </div>
          </div>

          {/* Current Values (for debugging) - Only show in development */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Current Environment Values</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Supabase URL:</span>
                  <div className="text-gray-600 font-mono text-xs break-all">
                    {envVars.supabaseUrl ? 'Configured' : 'Not set'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Supabase Key:</span>
                  <div className="text-gray-600 font-mono text-xs">
                    {envVars.supabaseKey ? 'Configured' : 'Not set'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">OpenAI Key:</span>
                  <div className="text-gray-600 font-mono text-xs">
                    {envVars.openaiKey ? 'Configured' : 'Not set'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">ElevenLabs Agent:</span>
                  <div className="text-gray-600 font-mono text-xs">
                    {envVars.elevenLabsAgent ? 'Configured' : 'Not set'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Close Setup Guide
          </button>
        </div>
      </div>
    </div>
  )
}