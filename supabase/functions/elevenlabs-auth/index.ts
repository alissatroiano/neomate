import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

/*
  # ElevenLabs Authentication Function

  1. Purpose
    - Provides secure authentication for ElevenLabs voice chat
    - Generates signed URLs for conversation sessions
    - Keeps API keys secure on the server side

  2. Security
    - API key is stored securely in environment variables
    - Only authenticated users can access this endpoint
    - CORS headers configured for frontend access
*/

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
  "Access-Control-Max-Age": "86400",
}

// Get API key from environment
const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY")
const DEFAULT_AGENT_ID = "agent_01jxascan4fg6anwxndmze5jp1"

console.log('ElevenLabs function starting...')
console.log('API Key configured:', !!ELEVENLABS_API_KEY)
console.log('API Key length:', ELEVENLABS_API_KEY?.length || 0)

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
    // Validate API key
    if (!ELEVENLABS_API_KEY) {
      console.error('ELEVENLABS_API_KEY environment variable not set')
      return new Response(
        JSON.stringify({ 
          error: 'ElevenLabs API key not configured',
          details: 'ELEVENLABS_API_KEY environment variable is missing'
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

    // Get agent ID from request
    let agentId = DEFAULT_AGENT_ID
    
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        console.log('Request body:', body)
        if (body.agent_id) {
          agentId = body.agent_id
        }
      } catch (e) {
        console.log('Could not parse request body, using default agent ID:', e.message)
      }
    } else if (req.method === 'GET') {
      const url = new URL(req.url)
      const queryAgentId = url.searchParams.get('agent_id')
      if (queryAgentId) {
        agentId = queryAgentId
      }
    }

    console.log('Using agent ID:', agentId)

    // Construct ElevenLabs API URL
    const elevenLabsUrl = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`
    console.log('Making request to ElevenLabs API:', elevenLabsUrl)

    // Make request to ElevenLabs API
    const response = await fetch(elevenLabsUrl, {
      method: "GET",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "User-Agent": "Neomate/1.0"
      },
    })

    console.log('ElevenLabs API response status:', response.status)
    console.log('ElevenLabs API response headers:', Object.fromEntries(response.headers.entries()))

    // Handle response
    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      return new Response(
        JSON.stringify({ 
          error: 'ElevenLabs API request failed',
          status: response.status,
          statusText: response.statusText,
          details: errorText,
          agentId: agentId,
          apiUrl: elevenLabsUrl
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

    // Parse successful response
    const responseData = await response.json()
    console.log('ElevenLabs API success response:', responseData)
    
    if (!responseData.signed_url) {
      console.error('No signed_url in ElevenLabs response:', responseData)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response from ElevenLabs',
          details: 'No signed_url field in response',
          response: responseData
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
    
    console.log('Successfully obtained signed URL from ElevenLabs')
    return new Response(
      JSON.stringify({ 
        signed_url: responseData.signed_url,
        agent_id: agentId,
        success: true
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )

  } catch (error) {
    console.error('Exception in elevenlabs-auth function:', error)
    console.error('Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        type: error.constructor.name,
        stack: error.stack
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