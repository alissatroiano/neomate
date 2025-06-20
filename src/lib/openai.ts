// OpenAI integration via Supabase Edge Function
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function generateChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    console.log('Supabase URL:', supabaseUrl ? 'configured' : 'missing')
    console.log('Supabase Anon Key:', supabaseAnonKey ? 'configured' : 'missing')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing')
    }

    // Get the last user message
    const userMessage = messages[messages.length - 1]?.content
    if (!userMessage) {
      throw new Error('No user message found')
    }

    console.log('Calling edge function with user message:', userMessage.substring(0, 50) + '...')

    // Call our Supabase edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/chat-completion`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.slice(0, -1), // Previous conversation history
        userMessage: userMessage
      })
    })

    console.log('Edge function response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Edge function error response:', errorText)
      
      try {
        const errorData = JSON.parse(errorText)
        console.error('Edge function error data:', errorData)
        
        // Return fallback from edge function if available
        if (errorData.fallback) {
          return errorData.fallback
        }
      } catch (parseError) {
        console.error('Could not parse error response as JSON')
      }
      
      throw new Error(`API call failed: ${response.status}`)
    }

    const data = await response.json()
    console.log('Edge function response data:', data)
    
    if (data.response) {
      return data.response
    } else if (data.fallback) {
      return data.fallback
    } else {
      throw new Error('No response received from AI')
    }
    
  } catch (error) {
    console.error('Error generating chat response:', error)
    
    // Provide a compassionate fallback response
    return 'I\'m experiencing some technical difficulties right now, but I want you to know that your concerns are valid and important. Please don\'t hesitate to speak directly with your baby\'s medical team about any questions or worries you have. They are there to support you and provide the specific guidance you need. You\'re doing an amazing job navigating this challenging journey.'
  }
}

export async function generateConversationTitle(firstMessage: string): Promise<string> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return 'NICU Support Chat'
    }

    // Call our edge function for title generation
    const response = await fetch(`${supabaseUrl}/functions/v1/chat-completion`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{
          role: 'system',
          content: 'Generate a short, empathetic title (3-6 words) for a NICU support conversation based on the user message. Focus on the main topic or concern. Examples: "Breathing Concerns", "First NICU Day", "Feeding Questions", "Going Home Soon"'
        }],
        userMessage: firstMessage
      })
    })

    if (response.ok) {
      const data = await response.json()
      const title = data.response?.trim()
      return title || 'NICU Support Chat'
    }
    
    return 'NICU Support Chat'
  } catch (error) {
    console.error('Error generating conversation title:', error)
    return 'NICU Support Chat'
  }
}