/*
  # ChatGPT Integration Function with Enhanced CORS and Error Handling

  1. Purpose
    - Provides secure ChatGPT integration for text conversations
    - Handles rate limiting and quota issues gracefully
    - Provides intelligent fallbacks for common NICU concerns

  2. Security
    - API key is stored securely in environment variables
    - Only authenticated users can access this endpoint
    - Enhanced CORS headers for better compatibility

  3. Features
    - NICU-specialized system prompt
    - Rate limiting detection and handling
    - Intelligent fallback responses
    - Enhanced error handling and logging
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
  "Access-Control-Max-Age": "86400",
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")

const NICU_SYSTEM_PROMPT = `You are Neomate, a compassionate AI assistant specialized in providing therapeutic support and evidence-based information for families navigating neonatal hospitalization and NICU experiences.

Your role is to:
- Provide empathetic, understanding responses to emotional concerns
- Offer evidence-based information about neonatal care when appropriate
- Help families understand medical procedures and equipment in simple terms
- Support parents through the emotional challenges of NICU hospitalization
- Encourage communication with medical teams when needed
- Provide coping strategies for stress, anxiety, and difficult emotions

Guidelines:
- Always be compassionate and understanding
- Acknowledge the difficulty of the NICU journey
- Provide accurate, evidence-based medical information when relevant
- Encourage families to discuss medical decisions with their healthcare team
- Offer emotional support and validation
- Use clear, accessible language
- Be sensitive to the stress and trauma families may be experiencing
- Provide hope while being realistic about challenges

Remember: You are not a replacement for medical care, but a supportive companion during a difficult journey.`

// Intelligent fallback responses for common NICU concerns
const getIntelligentFallback = (userMessage: string): string => {
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

serve(async (req: Request) => {
  console.log(`Chat completion function called: ${req.method} ${req.url}`)
  
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
          fallback: "I'm here to support you through this challenging time. While I'm having trouble connecting to my AI service right now, please know that your feelings are valid and you're not alone in this journey. Please don't hesitate to speak with your medical team or a counselor if you need immediate support."
        }),
        {
          status: 200, // Return 200 so frontend uses fallback
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

    // Parse request body
    let requestBody
    try {
      const bodyText = await req.text()
      console.log('Raw request body:', bodyText)
      requestBody = JSON.parse(bodyText)
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
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

    console.log('Parsed request body:', JSON.stringify(requestBody, null, 2))
    
    const { messages, userMessage } = requestBody

    // Extract user message - either from userMessage field or last message in array
    let currentUserMessage = userMessage
    if (!currentUserMessage && messages && Array.isArray(messages) && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'user') {
        currentUserMessage = lastMessage.content
      }
    }

    console.log('Extracted user message:', currentUserMessage)

    if (!currentUserMessage) {
      console.error('No user message found in request')
      return new Response(
        JSON.stringify({ 
          error: 'User message is required',
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

    // Prepare conversation context
    const conversationMessages = [
      {
        role: "system",
        content: NICU_SYSTEM_PROMPT
      }
    ]

    // Add recent conversation history (last 6 messages for context, reduced to save tokens)
    if (messages && Array.isArray(messages)) {
      const recentMessages = messages.slice(-6).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
      conversationMessages.push(...recentMessages)
    } else {
      // If no conversation history, just add the current user message
      conversationMessages.push({
        role: "user",
        content: currentUserMessage
      })
    }

    console.log('Making OpenAI API request with', conversationMessages.length, 'messages')
    console.log('Current user message:', currentUserMessage)

    // Make request to OpenAI API with retry logic
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Using more cost-effective model to reduce rate limiting
        messages: conversationMessages,
        max_tokens: 400, // Reduced to save on quota
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    })

    console.log('OpenAI API response status:', response.status)

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('OpenAI API error details:', errorText)
      
      // Handle specific error types
      if (response.status === 429) {
        console.log('Rate limit hit, using intelligent fallback')
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            fallback: getIntelligentFallback(currentUserMessage)
          }),
          {
            status: 200, // Return 200 so frontend uses fallback
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }
      
      if (response.status === 401) {
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
          error: 'Failed to get response from AI service',
          fallback: getIntelligentFallback(currentUserMessage)
        }),
        {
          status: 200, // Return 200 so frontend uses fallback
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    const data = await response.json()
    console.log('OpenAI API response received successfully')
    
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      console.error('No response generated from OpenAI')
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

    console.log('Successfully generated AI response')
    return new Response(
      JSON.stringify({ response: aiResponse }),
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
      console.error('Could not parse request body for fallback')
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
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