import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

/*
  # ChatGPT Integration Function with Enhanced Error Handling and Memory

  1. Purpose
    - Provides secure ChatGPT integration for text conversations
    - Maintains conversation memory within chat threads
    - Handles rate limiting and quota issues gracefully
    - Provides intelligent fallbacks for common NICU concerns

  2. Security
    - API key is stored securely in environment variables
    - Only authenticated users can access this endpoint
    - CORS headers configured for frontend access

  3. Features
    - NICU-specialized system prompt with memory instructions
    - Full conversation history context
    - Rate limiting detection and handling
    - Intelligent fallback responses
    - Enhanced error handling and logging
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
  "Access-Control-Max-Age": "86400",
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")
console.log('OpenAI API Key configured:', !!OPENAI_API_KEY);

const NICU_SYSTEM_PROMPT = `You are Neomate, a compassionate AI assistant for families in neonatal care. You provide:

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

// Intelligent fallback responses for common NICU concerns
const getIntelligentFallback = (userMessage: string): string => {
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
  
  // Default fallback
  return `I'm having technical difficulties, but your concerns are important. The NICU journey is challenging, and your feelings are valid.

Please speak with your medical team about any worries. You're doing an amazing job in a difficult situation.`
}

serve(async (req: Request) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.url}`)
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log('Handling CORS preflight request')
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    console.log('OpenAI API Key configured:', !!OPENAI_API_KEY)
    
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured',
          fallback: "I'm here to support you through this challenging time. While I'm having trouble connecting right now, please know that your feelings are valid and you're not alone. Please speak with your medical team if you need immediate support."
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    if (req.method !== "POST") {
      console.log(`Method ${req.method} not allowed`)
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    // Enhanced request body parsing with detailed logging
    let requestBody
    let bodyText = ''
    
    try {
      bodyText = await req.text()
      console.log('Raw request body length:', bodyText.length)
      console.log('Raw request body preview:', bodyText.substring(0, 200))
      
      if (!bodyText || bodyText.trim().length === 0) {
        console.error('Empty request body received')
        return new Response(
          JSON.stringify({ 
            error: 'Empty request body',
            fallback: getIntelligentFallback('')
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }
      
      requestBody = JSON.parse(bodyText)
      console.log('Successfully parsed request body:', Object.keys(requestBody))
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      console.error('Body text that failed to parse:', bodyText)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError.message,
          fallback: getIntelligentFallback('')
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }
    
    const { messages, userMessage } = requestBody

    // Extract user message with multiple fallback strategies
    let currentUserMessage = userMessage
    if (!currentUserMessage && messages && Array.isArray(messages) && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'user') {
        currentUserMessage = lastMessage.content
      }
    }

    console.log('User message found:', !!currentUserMessage)
    console.log('User message length:', currentUserMessage ? currentUserMessage.length : 0)
    console.log('Total messages in conversation:', messages ? messages.length : 0)

    if (!currentUserMessage || typeof currentUserMessage !== 'string' || !currentUserMessage.trim()) {
      console.error('No valid user message found in request')
      console.error('Request body structure:', JSON.stringify(requestBody, null, 2))
      return new Response(
        JSON.stringify({ 
          error: 'User message is required',
          received: { userMessage, messagesCount: messages ? messages.length : 0 },
          fallback: getIntelligentFallback('')
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    // Prepare conversation context with FULL history for memory
    const conversationMessages = [
      {
        role: "system",
        content: NICU_SYSTEM_PROMPT
      }
    ]

    // Add ALL conversation history (not just last 6) for proper memory
    if (messages && Array.isArray(messages) && messages.length > 0) {
      const allMessages = messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content || ''
      })).filter(msg => msg.content.trim())
      
      conversationMessages.push(...allMessages)
      console.log(`Added ${allMessages.length} messages for FULL conversation context`)
    }

    // Ensure we have the current user message
    if (!conversationMessages.some(msg => msg.role === 'user' && msg.content === currentUserMessage)) {
      conversationMessages.push({
        role: "user",
        content: currentUserMessage
      })
    }

    console.log(`Making OpenAI API request with ${conversationMessages.length} messages (including system prompt)`)
    console.log('Conversation context includes full history for memory:', conversationMessages.length > 2)

    // Make request to OpenAI API with enhanced error handling
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: conversationMessages,
        max_tokens: 300, // Reduced from 500 to encourage shorter responses
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    })

    console.log(`OpenAI API response status: ${openAIResponse.status}`)

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`)
      
      // Handle specific error types
      if (openAIResponse.status === 429) {
        console.log('Rate limit hit, using intelligent fallback')
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            fallback: getIntelligentFallback(currentUserMessage)
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }
      
      if (openAIResponse.status === 401) {
        console.log('API key invalid')
        return new Response(
          JSON.stringify({ 
            error: 'Invalid API key',
            fallback: getIntelligentFallback(currentUserMessage)
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API error: ${openAIResponse.status}`,
          fallback: getIntelligentFallback(currentUserMessage)
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    const data = await openAIResponse.json()
    console.log('OpenAI API response received successfully')
    
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse || typeof aiResponse !== 'string' || !aiResponse.trim()) {
      console.error('No valid response generated from OpenAI')
      return new Response(
        JSON.stringify({ 
          error: 'No response generated',
          fallback: getIntelligentFallback(currentUserMessage)
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    console.log('Successfully generated AI response with conversation memory')
    return new Response(
      JSON.stringify({ response: aiResponse.trim() }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  } catch (error) {
    console.error('Error in chat-completion function:', error)
    
    // Try to get user message for intelligent fallback
    let userMessage = ''
    try {
      const body = await req.clone().json()
      userMessage = body.userMessage || (body.messages && body.messages.length > 0 ? body.messages[body.messages.length - 1]?.content : '') || ''
    } catch (e) {
      console.error('Could not parse request body for fallback:', e)
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        fallback: getIntelligentFallback(userMessage)
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})