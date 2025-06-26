// Simple configuration check for ElevenLabs
export function isElevenLabsConfigured(): boolean {
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID
  const hasValidAgentId = !!agentId && 
                         agentId !== 'your-agent-id-here' && 
                         agentId.startsWith('agent_')
  
  console.log('ElevenLabs configuration check:', {
    hasAgentId: !!agentId,
    agentIdValid: hasValidAgentId,
    agentId: agentId ? `${agentId.substring(0, 15)}...` : 'none'
  })
  
  return hasValidAgentId
}

// Export the agent ID for use in components
export function getElevenLabsAgentId(): string {
  return import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_01jxascan4fg6anwxndmze5jp1'
}