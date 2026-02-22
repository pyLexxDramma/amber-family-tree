const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    // The path after the function name, e.g. /openai-proxy/v1/audio/speech → /v1/audio/speech
    const pathMatch = url.pathname.match(/\/openai-proxy(\/.*)/);
    const openaiPath = pathMatch?.[1] || "/v1/chat/completions";

    const openaiUrl = `https://api.openai.com${openaiPath}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${apiKey}`);
    headers.set("Content-Type", req.headers.get("Content-Type") || "application/json");

    const res = await fetch(openaiUrl, {
      method: "POST",
      headers,
      body: req.body,
    });

    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set("Content-Type", res.headers.get("Content-Type") || "application/octet-stream");

    const body = await res.arrayBuffer();
    return new Response(body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
