import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

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

SAFETY & BOUNDARIES:
- Always recommend immediate medical attention for urgent concerns
- Clearly state when situations require immediate professional intervention
- Never provide specific medical diagnoses or treatment recommendations
- Encourage open communication with healthcare providers
- Maintain appropriate boundaries while being supportive

RESPONSE APPROACH:
1. Acknowledge the emotional aspect of their situation first
2. Provide relevant, evidence-based information
3. Offer emotional support and validation
4. Suggest next steps or coping strategies
5. Remind them of available support resources

Remember: Every family's NICU journey is unique. Your role is to provide comfort, information, and support during one of the most challenging times in their lives.`

export async function generateChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    console.log('Generating OpenAI response for', messages.length, 'messages')
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: NEOMATE_SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 600,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })

    const aiResponse = response.choices[0]?.message?.content
    
    if (!aiResponse) {
      throw new Error('No response generated from OpenAI')
    }

    console.log('OpenAI response generated successfully')
    return aiResponse

  } catch (error: any) {
    console.error('Error generating chat response:', error)
    
    // Handle specific OpenAI errors
    if (error?.status === 429) {
      console.log('Rate limit hit, using intelligent fallback')
      return getIntelligentFallback(messages[messages.length - 1]?.content || '')
    }
    
    if (error?.status === 401) {
      console.log('Invalid API key')
      return 'I\'m having trouble connecting to my AI service due to an authentication issue. Please check that your OpenAI API key is correctly configured. In the meantime, please don\'t hesitate to speak directly with your baby\'s medical team about any questions or concerns.'
    }
    
    if (error?.status === 403) {
      console.log('API access forbidden')
      return 'I\'m unable to access my AI service right now due to access restrictions. Please ensure your OpenAI API key has the necessary permissions. Your medical team is always available to answer questions and provide support.'
    }
    
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
  
  // Default fallback
  return `I'm experiencing technical difficulties right now, but I want you to know that your concerns are valid and important. The NICU journey is incredibly challenging, and it's completely normal to feel overwhelmed.

Please don't hesitate to speak directly with your baby's medical team about any questions or worries you have. They are there to support you and provide the specific guidance you need.

You're doing an amazing job navigating this challenging journey. Your love and presence matter more than you know.`
}

export async function generateConversationTitle(firstMessage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Generate a short, empathetic title (3-6 words) for a NICU support conversation based on the first message. Focus on the main topic or concern. Examples: "Breathing Concerns", "First NICU Day", "Feeding Questions", "Going Home Soon"'
        },
        {
          role: 'user',
          content: firstMessage
        }
      ],
      temperature: 0.5,
      max_tokens: 20
    })

    const title = response.choices[0]?.message?.content?.trim()
    return title || generateLocalTitle(firstMessage)
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