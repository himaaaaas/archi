// Vercel serverless function — keeps your Anthropic API key on the server side.
// The browser never sees the key. All requests from the React app hit this endpoint.

export const config = {
  maxDuration: 60, // allow up to 60 seconds for large palette generation
};

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY environment variable is not set." });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing prompt in request body." });
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 10000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    // Safely parse response — Anthropic occasionally returns plain text on errors
    let data;
    try {
      data = await anthropicRes.json();
    } catch {
      const raw = await anthropicRes.text().catch(() => "");
      console.error("Non-JSON response from Anthropic:", raw.slice(0, 200));
      return res.status(502).json({ error: "upstream_error" });
    }

    if (!anthropicRes.ok) {
      const msg = data?.error?.message || "";
      console.error("Anthropic API error:", anthropicRes.status, msg);

      // Map to internal error codes — never leak billing/key details to client
      if (anthropicRes.status === 429 || msg.includes("rate limit")) {
        return res.status(429).json({ error: "rate_limit" });
      }
      if (msg.includes("credit") || msg.includes("balance") || msg.includes("billing")) {
        return res.status(402).json({ error: "service_unavailable" });
      }
      return res.status(502).json({ error: "upstream_error" });
    }

    // Extract all text blocks from the response
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    return res.status(200).json({ text });
  } catch (err) {
    console.error("LandPal proxy error:", err);
    return res.status(500).json({ error: "server_error" });
  }
}
