import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("[UPGRADE-SUBSCRIPTION] Function script loaded.");

serve(async (req) => {
  console.log(`[UPGRADE-SUBSCRIPTION] Request received: ${req.method}`);

  if (req.method === 'OPTIONS') {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let body;
    try {
        body = await req.json();
        console.log("[UPGRADE-SUBSCRIPTION] Request body parsed successfully:", body);
    } catch (e) {
        console.error("[UPGRADE-SUBSCRIPTION] FATAL: Error parsing request body:", e);
        throw new Error(`Failed to parse request body: ${e.message}`);
    }

    // A simple success response
    const responsePayload = {
        success: true,
        message: "Hello from the upgrade-subscription function!",
        receivedBody: body
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("[UPGRADE-SUBSCRIPTION] FATAL: Unhandled error in main try-catch:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});