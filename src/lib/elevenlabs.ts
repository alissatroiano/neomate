import { supabase, isSupabaseConfigured } from './supabase'

export interface VoiceChatSession {
  signedUrl: string
  agentId: string
}

export async function getElevenLabsSignedUrl(): Promise<VoiceChatSession> {
  try {
    console.log('Getting ElevenLabs signed URL...')
    
    // Get agent ID from environment variable
    const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID
    
    if (!agentId) {
      throw new Error('ElevenLabs agent ID not configured. Please set VITE_ELEVENLABS_AGENT_ID environment variable.')
    }
    
    console.log('Using agent ID:', agentId)
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not properly configured. Please set up your Supabase environment variables.')
    }
    
    console.log('Making request to elevenlabs-auth function...')
    
    // Use POST method with body to send agent_id
    const { data, error } = await supabase.functions.invoke('elevenlabs-auth', {
      body: { 
        agent_id: agentId 
      }
    })

    console.log('Supabase function response:', { 
      hasData: !!data, 
      hasError: !!error,
      dataKeys: data ? Object.keys(data) : [],
      errorMessage: error?.message 
    })

    if (error) {
      console.error('Supabase function error:', error)
      
      // Provide detailed error information based on error type
      let errorMessage = 'Cannot connect to voice service.'
      
      if (error.message?.includes('Failed to send a request') || 
          error.message?.includes('fetch') ||
          error.message?.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to voice service. Please check your internet connection and try again.'
      } else if (error.message?.includes('401')) {
        errorMessage = 'Voice service authentication failed. Please check your API key configuration.'
      } else if (error.message?.includes('404')) {
        errorMessage = 'Voice agent not found. Please check your agent ID configuration.'
      } else if (error.message?.includes('429')) {
        errorMessage = 'Voice service rate limit exceeded. Please try again in a few minutes.'
      } else if (error.message?.includes('500')) {
        errorMessage = 'Voice service is temporarily unavailable. Please try again later.'
      } else if (error.message) {
        errorMessage += ` Error: ${error.message}`
      }
      
      // Add context from error response if available
      if (error.context?.body) {
        const errorBody = error.context.body
        if (errorBody.details) {
          errorMessage += ` Details: ${errorBody.details}`
        }
        if (errorBody.status) {
          errorMessage += ` (Status: ${errorBody.status})`
        }
      }
      
      throw new Error(errorMessage)
    }

    if (!data) {
      console.error('No data in response')
      throw new Error('No response data received from voice service')
    }

    if (!data.signed_url) {
      console.error('No signed URL in response:', data)
      throw new Error('No signed URL received from ElevenLabs service. Please check your agent configuration.')
    }

    console.log('ElevenLabs signed URL obtained successfully')
    console.log('Response data:', {
      hasSignedUrl: !!data.signed_url,
      agentId: data.agent_id,
      success: data.success,
      timestamp: data.timestamp
    })
    
    return {
      signedUrl: data.signed_url,
      agentId: data.agent_id || agentId
    }
  } catch (error) {
    console.error('Error in getElevenLabsSignedUrl:', error)
    throw error
  }
}

export function isElevenLabsConfigured(): boolean {
  // Check if we have the agent ID configured
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID
  const hasAgentId = !!agentId && agentId !== 'your-agent-id-here' && agentId.startsWith('agent_')
  
  // Also check if Supabase is configured (needed for the edge function)
  const hasSupabase = isSupabaseConfigured()
  
  console.log('ElevenLabs configuration check:', {
    hasAgentId,
    hasSupabase,
    agentId: agentId ? `${agentId.substring(0, 15)}...` : 'none',
    agentIdValid: agentId ? agentId.startsWith('agent_') : false
  })
  
  return hasAgentId && hasSupabase
}