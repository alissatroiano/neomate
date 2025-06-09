'use strict';
import { HeadersInit } from "node-fetch";

const requestHeaders = new Headers();
requestHeaders.set("xi-api-key", process.env.VITE_ELEVENLABS_API_KEY); // use your ElevenLabs API key

const response = await fetch(
  "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id={{}}",
  {
    method: "GET",
    headers: requestHeaders,
  }
);

if (!response.ok) {
  return Response.error();
}

const body = await response.json();
const url = body.signed_url; // use this URL for startSession method.
