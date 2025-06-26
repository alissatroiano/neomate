import { supabase } from './supabase'

export interface VoiceChatSession {
  signedUrl: string
  agentId: string
}

export async function getElevenLabsSignedUrl(): Promise<VoiceChatSession> {
  try {
    console.log('Getting ElevenLabs signed URL...')
    
    const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_01jxascan4fg6anwxndmze5jp1'
    console.log('Using agent ID:', agentId)
    
    // Use POST method with body instead of query parameters
    const { data, error } = await supabase.functions.invoke('elevenlabs-auth', {
      body: { 
        agent_id: agentId 
      }
    })

    console.log('Supabase function response:', { data, error })

    if (error) {
      console.error('Error getting ElevenLabs signed URL:', error)
      
      // Provide more detailed error information
      let errorMessage = 'Failed to get voice chat session'
      if (error.message) {
        errorMessage += `: ${error.message}`
      }
      if (error.context?.body?.details) {
        errorMessage += ` - ${error.context.body.details}`
      }
      
      throw new Error(errorMessage)
    }

    if (!data?.signed_url) {
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
  
  console.log('ElevenLabs configuration check:', {
    hasAgentId,
    agentId: agentId ? `${agentId.substring(0, 10)}...` : 'none'
  })
  
  return hasAgentId
}