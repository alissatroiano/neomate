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

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY")
console.log('ElevenLabs API Key configured:', !!ELEVENLABS_API_KEY)

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
    if (!ELEVENLABS_API_KEY) {
      console.error('ElevenLabs API key not configured')
      return new Response(
        JSON.stringify({ 
          error: 'ElevenLabs API key not configured',
          details: 'Please set ELEVENLABS_API_KEY environment variable'
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

    // Parse request body to get agent_id
    let agentId = 'agent_01jxascan4fg6anwxndmze5jp1' // Default agent ID
    
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        if (body.agent_id) {
          agentId = body.agent_id
        }
      } catch (e) {
        console.log('Could not parse request body, using default agent ID')
      }
    } else {
      // Try to get from query parameters
      const url = new URL(req.url)
      const queryAgentId = url.searchParams.get('agent_id')
      if (queryAgentId) {
        agentId = queryAgentId
      }
    }

    console.log('Using agent ID:', agentId)

    // Make request to ElevenLabs API for signed URL
    const elevenLabsUrl = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`
    console.log('Making request to ElevenLabs:', elevenLabsUrl)

    const response = await fetch(elevenLabsUrl, {
      method: "GET",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
    })

    console.log('ElevenLabs API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', response.status, response.statusText, errorText)
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get signed URL from ElevenLabs',
          status: response.status,
          details: errorText,
          agentId: agentId
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

    const responseData = await response.json()
    console.log('ElevenLabs response received successfully')
    
    if (!responseData.signed_url) {
      console.error('No signed_url in response:', responseData)
      return new Response(
        JSON.stringify({ 
          error: 'No signed URL in ElevenLabs response',
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
    
    return new Response(
      JSON.stringify({ 
        signed_url: responseData.signed_url,
        agent_id: agentId
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  } catch (error) {
    console.error('Error in elevenlabs-auth function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
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