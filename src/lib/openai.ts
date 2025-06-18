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
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: NEOMATE_SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 800,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })

    return response.choices[0]?.message?.content || 'I apologize, but I\'m having trouble responding right now. Please know that I\'m here to support you, and I encourage you to reach out to your medical team if you have urgent concerns.'
  } catch (error) {
    console.error('Error generating chat response:', error)
    
    // Provide a compassionate fallback response
    return 'I\'m experiencing some technical difficulties right now, but I want you to know that your concerns are valid and important. Please don\'t hesitate to speak directly with your baby\'s medical team about any questions or worries you have. They are there to support you and provide the specific guidance you need. You\'re doing an amazing job navigating this challenging journey.'
  }
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
    return title || 'NICU Support Chat'
  } catch (error) {
    console.error('Error generating conversation title:', error)
    return 'NICU Support Chat'
  }
}