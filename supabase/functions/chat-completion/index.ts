 comforting to your baby, even with breathing equipment. You're doing everything right by being there and asking questions.`
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
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  
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

    // Parse request body with better error handling
    let requestBody
    try {
      const bodyText = await req.text()
      console.log('Request body length:', bodyText.length)
      
      if (!bodyText.trim()) {
        throw new Error('Empty request body')
      }
      
      requestBody = JSON.parse(bodyText)
      console.log('Successfully parsed request body')
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
    
    const { messages, userMessage } = requestBody

    // Extract user message with multiple fallback strategies
    let currentUserMessage = userMessage
    if (!currentUserMessage && messages && Array.isArray(messages) && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage && lastMessage.role === 'user') {
        currentUserMessage = lastMessage.content
      }
    }

    console.log('Processing user message:', currentUserMessage ? 'Found' : 'Not found')

    if (!currentUserMessage || typeof currentUserMessage !== 'string' || !currentUserMessage.trim()) {
      console.error('No valid user message found in request')
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

    // Add recent conversation history (last 6 messages for context)
    if (messages && Array.isArray(messages) && messages.length > 0) {
      const recentMessages = messages.slice(-6).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content || ''
      })).filter(msg => msg.content.trim())
      
      conversationMessages.push(...recentMessages)
      console.log(`Added ${recentMessages.length} context messages`)
    }

    // Ensure we have the current user message
    if (!conversationMessages.some(msg => msg.role === 'user' && msg.content === currentUserMessage)) {
      conversationMessages.push({
        role: "user",
        content: currentUserMessage
      })
    }

    console.log(`Making OpenAI API request with ${conversationMessages.length} messages`)

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
        max_tokens: 400,
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

    console.log('Successfully generated AI response')
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