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

    // Always try to parse the response
    let data
    try {
      const responseText = await response.text()
      console.log('Edge function raw response:', responseText)
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Could not parse response as JSON:', parseError)
      throw new Error('Invalid response from server')
    }

    console.log('Edge function response data:', data)
    
    // Check for response first (successful AI response)
    if (data.response) {
      console.log('Using AI response')
      return data.response
    } 
    
    // If no AI response but we have a fallback, use it
    if (data.fallback) {
      console.log('Using intelligent fallback response')
      return data.fallback
    }
    
    // If we have an error but also a fallback, use the fallback
    if (data.error && data.fallback) {
      console.log('Using fallback due to error:', data.error)
      return data.fallback
    }
    
    // If we only have an error, throw it
    if (data.error) {
      console.log('Server returned error:', data.error)
      throw new Error(data.error)
    }
    
    // No response at all
    throw new Error('No response received from AI')
    
  } catch (error) {
    console.error('Error generating chat response:', error)
    
    // Get the user message for intelligent fallback
    const userMessage = messages[messages.length - 1]?.content || ''
    
    // Provide intelligent fallback based on user message content
    return getLocalIntelligentFallback(userMessage)
  }
}

// Local fallback function that mirrors the server-side logic
function getLocalIntelligentFallback(userMessage: string): string {
  const message = userMessage.toLowerCase()
  
  if (message.includes('eiee') || message.includes('epilepsy') || message.includes('seizure')) {
    return `I understand you're concerned about EIEE (Early Infantile Epileptic Encephalopathy). This is understandably very frightening for any parent. EIEE is a rare but serious condition that typically appears in the first few months of life with seizures that can be difficult to control.

While I'm having technical difficulties accessing my full knowledge base right now, I want you to know that:

• Your medical team is the best resource for specific information about your baby's condition and treatment plan
• Many families have walked this path before you, and support is available
• Each baby's journey with EIEE is unique, and treatments continue to improve
• It's completely normal to feel overwhelmed, scared, and uncertain

Please don't hesitate to ask your neurologist or neonatologist about:
- Treatment options and their goals
- What to expect in the coming days/weeks
- Support resources for families
- How you can best support your baby

You're not alone in this journey. Your love and advocacy for your baby matters tremendously.`
  }
  
  if (message.includes('breathing') || message.includes('ventilator') || message.includes('oxygen')) {
    return `I understand you have concerns about your baby's breathing. This is one of the most common and frightening aspects of NICU care for parents. While I'm having technical difficulties right now, I want to reassure you that breathing support is very common in the NICU, and the medical team is closely monitoring your baby.

Please speak with your nurse or doctor about:
- What type of breathing support your baby is receiving
- What the monitors and alarms mean
- How your baby is progressing
- When changes to breathing support might be expected

Your presence and voice can be comforting to your baby, even with breathing equipment. You're doing everything right by being there and asking questions.`
  }
  
  if (message.includes('feeding') || message.includes('tube') || message.includes('milk')) {
    return `Feeding concerns are very common in the NICU. Whether it's about tube feeding, breastfeeding, or formula, know that the medical team will work with you to find the best approach for your baby. While I'm having technical difficulties, I encourage you to discuss your feeding goals and concerns with your baby's care team. They can provide specific guidance based on your baby's needs and development.`
  }
  
  if (message.includes('scared') || message.includes('afraid') || message.includes('worried') || message.includes('anxious')) {
    return `Your feelings are completely valid and normal. The NICU experience is overwhelming, and it's natural to feel scared, worried, or anxious. While I'm having technical difficulties right now, I want you to know that you're not alone. Many parents have felt exactly what you're feeling.

Consider reaching out to:
- Your baby's social worker or family support coordinator
- Other NICU parents (many hospitals have support groups)
- A counselor who specializes in medical trauma
- Your own support network of family and friends

Taking care of your emotional well-being is important for both you and your baby. You're being the best parent you can be in an incredibly difficult situation.`
  }
  
  // Default fallback
  return `I'm experiencing technical difficulties right now, but I want you to know that your concerns are valid and important. The NICU journey is incredibly challenging, and it's completely normal to feel overwhelmed.

Please don't hesitate to speak directly with your baby's medical team about any questions or worries you have. They are there to support you and provide the specific guidance you need.

You're doing an amazing job navigating this challenging journey. Your love and presence matter more than you know.`
}

export async function generateConversationTitle(firstMessage: string): Promise<string> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return generateLocalTitle(firstMessage)
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
      const title = data.response?.trim() || data.fallback?.trim()
      return title || generateLocalTitle(firstMessage)
    }
    
    return generateLocalTitle(firstMessage)
  } catch (error) {
    console.error('Error generating conversation title:', error)
    return generateLocalTitle(firstMessage)
  }
}

// Generate title locally based on message content
function generateLocalTitle(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('eiee') || lowerMessage.includes('epilepsy')) {
    return 'EIEE Support'
  }
  if (lowerMessage.includes('breathing') || lowerMessage.includes('ventilator')) {
    return 'Breathing Concerns'
  }
  if (lowerMessage.includes('feeding') || lowerMessage.includes('milk')) {
    return 'Feeding Questions'
  }
  if (lowerMessage.includes('scared') || lowerMessage.includes('worried')) {
    return 'Emotional Support'
  }
  if (lowerMessage.includes('home') || lowerMessage.includes('discharge')) {
    return 'Going Home'
  }
  if (lowerMessage.includes('first') || lowerMessage.includes('new')) {
    return 'First NICU Day'
  }
  
  return 'NICU Support Chat'
}