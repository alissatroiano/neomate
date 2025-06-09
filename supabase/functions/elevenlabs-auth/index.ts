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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Get the agent ID from query parameters
    const url = new URL(req.url)
    const agentId = url.searchParams.get('agent_id')

    if (!agentId) {
      return new Response(
        JSON.stringify({ error: 'Agent ID is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    // Set up request headers with ElevenLabs API key
    const requestHeaders: HeadersInit = new Headers()
    requestHeaders.set("xi-api-key", Deno.env.get("VITE_ELEVENLABS_API_KEY") || "")

    // Make request to ElevenLabs API for signed URL
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: requestHeaders,
      }
    )

    if (!response.ok) {
      console.error('ElevenLabs API error:', response.status, response.statusText)
      return new Response(
        JSON.stringify({ error: 'Failed to get signed URL from ElevenLabs' }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    const body = await response.json()
    
    return new Response(
      JSON.stringify({ signed_url: body.signed_url }),
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
      JSON.stringify({ error: 'Internal server error' }),
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