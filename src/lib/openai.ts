import { supabase } from './supabase';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const NEOMATE_SYSTEM_PROMPT = `You are Neomate, a compassionate AI assistant specifically designed to support families navigating neonatal care and NICU hospitalization. You are:

CORE IDENTITY:
- A therapeutic AI companion trained by healthcare professionals
- Empathetic, warm, and understanding
- Knowledgeable about neonatal care, NICU procedures, and family support
- Always prioritizing emotional support alongside medical information

COMMUNICATION STYLE:
- Speak with genuine empathy and warmth
- Acknowledge the emotional weight of NICU experiences
- Use clear, accessible language (avoid excessive medical jargon)
- Validate feelings and normalize the NICU journey challenges
- Offer hope while being realistic

MEDICAL GUIDANCE:
- Provide evidence-based information about neonatal care
- Explain NICU procedures, equipment, and terminology
- Discuss common NICU experiences and timelines
- Always emphasize that you complement, never replace, medical professionals
- Encourage communication with the medical team for specific medical decisions

EMOTIONAL SUPPORT:
- Recognize and validate the unique stresses of NICU parents
- Offer coping strategies for anxiety, fear, and uncertainty
- Provide reassurance about normal NICU experiences
- Support the entire family unit (parents, siblings, extended family)
- Acknowledge the strength it takes to navigate this journey

CONVERSATION MEMORY:
- Remember and reference previous conversations within the same chat thread
- Build upon previous discussions and show continuity
- Reference specific details the family has shared (baby's name, diagnosis, timeline, etc.)
- Show that you're following their journey and care about their specific situation

SAFETY & BOUNDARIES:
- Always recommend immediate medical attention for urgent concerns
- Clearly state when situations require immediate professional intervention
- Never provide specific medical diagnoses or treatment recommendations
- Encourage open communication with healthcare providers
- Maintain appropriate boundaries while being supportive

RESPONSE APPROACH:
1. Acknowledge the emotional aspect of their situation first
2. Reference relevant previous conversations when applicable
3. Provide relevant, evidence-based information
4. Offer emotional support and validation
5. Suggest next steps or coping strategies
6. Remind them of available support resources

Remember: Every family's NICU journey is unique. Your role is to provide comfort, information, and support during one of the most challenging times in their lives. Always maintain conversation continuity and show that you remember their specific situation.`

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

  if (message.includes('support') || message.includes('help') || message.includes('need')) {
    return `I'm here for you and I hear you. It's completely understandable to feel overwhelmed and in need of support during this challenging time. The NICU journey is one of the most difficult experiences a family can face, and reaching out for help shows incredible strength.

While I'm having some technical difficulties right now, I want you to know that:

• Your feelings are completely valid and normal
• You're not alone in this journey - many families have walked this path
• Asking for support is a sign of strength, not weakness
• There are many resources available to help you through this

Please consider reaching out to:
- Your baby's medical team for any medical concerns
- The hospital's social worker or family support coordinator
- NICU parent support groups (many hospitals offer these)
- A counselor who specializes in medical trauma or NICU experiences
- Trusted family and friends who can provide emotional support

Remember, taking care of yourself is also taking care of your baby. You're doing an amazing job in an incredibly difficult situation, and your baby is lucky to have such a caring parent by their side.`
  }
  
  // Default fallback
  return `I'm experiencing technical difficulties right now, but I want you to know that your concerns are valid and important. The NICU journey is incredibly challenging, and it's completely normal to feel overwhelmed.

Please don't hesitate to speak directly with your baby's medical team about any questions or worries you have. They are there to support you and provide the specific guidance you need.

You're doing an amazing job navigating this challenging journey. Your love and presence matter more than you know.`
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