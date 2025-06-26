import { supabase, isSupabaseConfigured } from './supabase'

export interface VoiceChatSession {
  signedUrl: string
  agentId: string
}

export async function getElevenLabsSignedUrl(): Promise<VoiceChatSession> {
  try {
    console.log('Getting ElevenLabs signed URL...')
    
    const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_01jxascan4fg6anwxndmze5jp1'
    console.log('Using agent ID:', agentId)
    
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not properly configured. Please set up your Supabase environment variables.')
    }
    
    console.log('Making request to elevenlabs-auth function...')
    
    // Use POST method with body
    const { data, error } = await supabase.functions.invoke('elevenlabs-auth', {
      body: { 
        agent_id: agentId 
      }
    })

    console.log('Supabase function response:', { data, error })

    if (error) {
      console.error('Supabase function error:', error)
      
      // Provide detailed error information
      let errorMessage = 'Cannot connect to voice service. Please check your internet connection and try again.'
      
      if (error.message?.includes('Failed to send a request')) {
        errorMessage = 'Cannot connect to voice service. Please check your internet connection and try again.'
      } else if (error.message) {
        errorMessage += ` - ${error.message}`
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
      throw new Error('No signed URL received from ElevenLabs service')
    }

    console.log('ElevenLabs signed URL obtained successfully')
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
  const hasAgentId = !!agentId && agentId !== 'your-agent-id-here'
  
  // Also check if Supabase is configured (needed for the edge function)
  const hasSupabase = isSupabaseConfigured()
  
  console.log('ElevenLabs configuration check:', {
    hasAgentId,
    hasSupabase,
    agentId: agentId ? `${agentId.substring(0, 10)}...` : 'none'
  })
  
  return hasAgentId && hasSupabase
}