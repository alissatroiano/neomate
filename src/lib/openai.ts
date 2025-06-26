import { supabase } from './supabase';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const NEOMATE_SYSTEM_PROMPT = `You are Neomate, a compassionate AI assistant for families in neonatal care. You provide:

COMMUNICATION STYLE:
- Keep responses SHORT and focused (2-3 paragraphs maximum)
- Lead with empathy, then provide key information
- Use simple, clear language
- Be warm but concise
- Avoid lengthy explanations unless specifically asked

CORE APPROACH:
1. Acknowledge their feelings briefly
2. Give essential information or guidance
3. Suggest one clear next step
4. Offer continued support

MEDICAL GUIDANCE:
- Provide evidence-based neonatal care information
- Explain NICU procedures simply
- Always recommend discussing specifics with medical team
- Focus on most important points, not comprehensive details

EMOTIONAL SUPPORT:
- Validate feelings quickly and genuinely
- Offer practical coping strategies
- Normalize NICU experiences
- Be reassuring but realistic

CONVERSATION MEMORY:
- Remember previous conversations in this chat
- Reference specific details they've shared (baby's name, diagnosis, etc.)
- Show continuity without repeating everything

RESPONSE LENGTH:
- Aim for 3-5 sentences for simple questions
- Maximum 2-3 short paragraphs for complex topics
- Be complete but concise
- Quality over quantity

Remember: Families are overwhelmed. Give them what they need to know without information overload. Be their supportive companion, not a medical textbook.`

export async function generateChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    console.log('Generating AI response via Supabase Edge Function for', messages.length, 'messages')
    
    // Get the latest user message
    const userMessage = messages[messages.length - 1]?.content || ''
    
    if (!userMessage.trim()) {
      throw new Error('No user message provided')
    }

    // Prepare the request body with the FULL conversation history
    const requestBody = {
      userMessage: userMessage.trim(),
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    }

    console.log('Sending request to Edge Function:', {
      userMessageLength: userMessage.length,
      messagesCount: requestBody.messages.length,
      requestBodySize: JSON.stringify(requestBody).length,
      fullConversationHistory: true
    })

    // Use Supabase client's functions.invoke method for better error handling
    const { data, error } = await supabase.functions.invoke('chat-completion', {
      body: requestBody
    })

    console.log('Edge Function response:', { data, error })

    if (error) {
      console.error('Supabase Edge Function error:', error)
      
      // Check if it's a network/connectivity error
      if (error.message?.includes('Failed to send a request') || 
          error.message?.includes('fetch') ||
          error.message?.includes('Failed to fetch')) {
        console.log('Network connectivity issue, using local fallback')
        return getIntelligentFallback(userMessage)
      }
      
      // Check if it's a function error with fallback
      if (error.context?.body?.fallback) {
        console.log('Using fallback from Edge Function error response')
        return error.context.body.fallback
      }
      
      return getIntelligentFallback(userMessage)
    }

    // Handle successful response
    if (data?.fallback) {
      console.log('Using fallback response from Edge Function')
      return data.fallback
    }

    if (data?.response) {
      console.log('AI response generated successfully via Edge Function')
      return data.response
    }

    // If we get here, something unexpected happened
    console.warn('Unexpected response format from Edge Function:', data)
    return getIntelligentFallback(userMessage)

  } catch (error: any) {
    console.error('Error calling Edge Function:', error)
    
    // Get user message for intelligent fallback
    const userMessage = messages[messages.length - 1]?.content || ''
    return getIntelligentFallback(userMessage)
  }
}

// Intelligent fallback responses for common NICU concerns
function getIntelligentFallback(userMessage: string): string {
  const message = userMessage.toLowerCase()
  
  if (message.includes('eiee') || message.includes('epilepsy') || message.includes('seizure')) {
    return `I understand your concern about EIEE. This is frightening, but you're not alone. Many families face this challenging condition, and treatments continue to improve.

Please ask your neurologist about treatment goals, what to expect, and support resources. Your love and advocacy matter tremendously during this difficult time.`
  }
  
  if (message.includes('breathing') || message.includes('ventilator') || message.includes('oxygen')) {
    return `Breathing concerns are very common in the NICU. The medical team is closely monitoring your baby, and breathing support helps many babies thrive.

Ask your nurse about what the monitors mean and how your baby is progressing. Your presence and voice are comforting, even with equipment around.`
  }
  
  if (message.includes('feeding') || message.includes('tube') || message.includes('milk')) {
    return `Feeding challenges are normal in the NICU. The team will work with you to find the best approach for your baby's needs and development.

Discuss your feeding goals with the care team - they can provide specific guidance based on your baby's progress.`
  }
  
  if (message.includes('scared') || message.includes('afraid') || message.includes('worried') || message.includes('anxious')) {
    return `Your feelings are completely normal. The NICU is overwhelming, and many parents feel exactly what you're experiencing.

Consider reaching out to your social worker, other NICU parents, or a counselor. Taking care of your emotional well-being helps both you and your baby.`
  }

  if (message.includes('support') || message.includes('help') || message.includes('need')) {
    return `You're not alone in this journey. Asking for help shows incredible strength during this challenging time.

Reach out to your medical team for medical concerns, the social worker for support resources, or trusted family and friends. Your baby is lucky to have such a caring parent.`
  }
  
  // Default fallback
  return `I'm having technical difficulties, but your concerns are important. The NICU journey is challenging, and your feelings are valid.

Please speak with your medical team about any worries. You're doing an amazing job in a difficult situation.`
}

export async function generateConversationTitle(firstMessage: string): Promise<string> {
  try {
    // For now, use local title generation to avoid additional API calls
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
  if (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('need')) {
    return 'Support Request'
  }
  if (lowerMessage.includes('home') || lowerMessage.includes('discharge')) {
    return 'Going Home'
  }
  if (lowerMessage.includes('first') || lowerMessage.includes('new')) {
    return 'First NICU Day'
  }
  
  return 'NICU Support Chat'
}