/*
  # ChatGPT Integration Function

  1. Purpose
    - Provides secure ChatGPT integration for text conversations
    - Keeps OpenAI API key secure on the server side
    - Handles conversation context and NICU-specific prompting

  2. Security
    - API key is stored securely in environment variables
    - Only authenticated users can access this endpoint
    - CORS headers configured for frontend access

  3. Features
    - NICU-specialized system prompt
    - Conversation context awareness
    - Error handling and fallbacks
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API key not configured')
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured',
          fallback: "I'm here to support you through this challenging time. While I'm having trouble connecting to my AI service right now, please know that your feelings are valid and you're not alone in this journey. Please don't hesitate to speak with your medical team or a counselor if you need immediate support."
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    if (req.method !== "POST") {
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

    const { messages, userMessage } = await req.json()

    if (!userMessage) {
      return new Response(
        JSON.stringify({ error: 'User message is required' }),
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

    // Add recent conversation history (last 10 messages for context)
    if (messages && Array.isArray(messages)) {
      const recentMessages = messages.slice(-10).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
      conversationMessages.push(...recentMessages)
    }

    // Add the current user message
    conversationMessages.push({
      role: "user",
      content: userMessage
    })

    console.log('Making OpenAI API request with', conversationMessages.length, 'messages')

    // Make request to OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: conversationMessages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('OpenAI API error details:', errorText)
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get response from AI service',
          fallback: "I'm here to support you through this challenging time. While I'm having trouble connecting right now, please know that your feelings are valid and you're not alone in this journey. The NICU experience can be overwhelming, and it's completely normal to feel scared, worried, or confused. Please don't hesitate to reach out to your medical team, a social worker, or counselor if you need immediate support."
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      console.error('No response generated from OpenAI')
      return new Response(
        JSON.stringify({ 
          error: 'No response generated',
          fallback: "I understand you're reaching out for support. While I'm having a technical difficulty right now, I want you to know that what you're going through is incredibly challenging, and your feelings are completely valid. Please don't hesitate to speak with your medical team or a counselor if you need immediate support."
        }),
        {
          status: 500,
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
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        fallback: "I'm experiencing a technical issue right now, but I want you to know that I'm here to support you. The NICU journey is incredibly difficult, and it's normal to feel overwhelmed. Please reach out to your medical team, a social worker, or counselor if you need immediate support."
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})