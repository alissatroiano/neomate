import { supabase } from './supabase'

export interface VoiceChatSession {
  signedUrl: string
  agentId: string
}

export async function getElevenLabsSignedUrl(): Promise<VoiceChatSession> {
  try {
    console.log('Getting ElevenLabs signed URL...')
    
    const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_01jxascan4fg6anwxndmze5jp1'
    
    const { data, error } = await supabase.functions.invoke('elevenlabs-auth', {
      body: { agent_id: agentId }
    })

    if (error) {
      console.error('Error getting ElevenLabs signed URL:', error)
      throw new Error(`Failed to get voice chat session: ${error.message}`)
    }

    if (!data?.signed_url) {
      throw new Error('No signed URL received from ElevenLabs')
    }

    console.log('ElevenLabs signed URL obtained successfully')
    return {
      signedUrl: data.signed_url,
      agentId
    }
  } catch (error) {
    console.error('Error in getElevenLabsSignedUrl:', error)
    throw error
  }
}

export function isElevenLabsConfigured(): boolean {
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID
  return !!agentId && agentId !== 'your-agent-id-here'
}