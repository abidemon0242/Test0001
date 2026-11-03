/**
 * Abid's Web Studio — Cloudflare Chatbot API
 *
 * Deploy from this directory with: npx wrangler deploy
 * Endpoint: POST /api/chat
 * Request:  { "message": "..." }
 * Response: { "reply": "..." }
 *
 * Required Cloudflare secret: GEMINI_API_KEY
 */

const SYSTEM_PROMPT = `You are the helpful sales assistant for Abid's Web Studio in Bangladesh.
Help visitors understand website services and submit an enquiry. Be concise, honest, and helpful.
Services include business websites, portfolio websites, landing pages, e-commerce websites, restaurant websites, and custom design.
Estimated packages:
- Basic 1-page website: around 2,500 BDT.
- Standard website with AI chatbot: 5,000-7,000 BDT.
- Advanced custom website with AI chatbot: 7,000-9,500 BDT.
Prices are estimates; the developer confirms the final price after reviewing requirements. Design and development are included. Hosting and payment processing are not included unless separately agreed.
Never invent deadlines, scarcity, guarantees, or customer testimonials. Ask one useful follow-up question. If the visitor wants to order, guide them to the order form or direct contact options. Keep answers to 2-4 short sentences.`;

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MAX_MESSAGE_LENGTH = 2000;
const MAX_BODY_BYTES = 16 * 1024;
const GEMINI_TIMEOUT_MS = 20_000;

// These are the website origins already authorized by the existing Vercel API.
const ALLOWED_ORIGINS = new Set([
  "https://test0001-tau.vercel.app",
  "https://test0001-abid-s-studio.vercel.app",
  "https://abidemon0242.github.io",
]);

function baseHeaders() {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
}

function corsHeaders(origin) {
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function jsonResponse(status, payload, origin, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...baseHeaders(),
      ...corsHeaders(origin),
      ...extraHeaders,
    },
  });
}

function errorResponse(status, message, origin, extraHeaders = {}) {
  return jsonResponse(status, { error: message }, origin, extraHeaders);
}

async function readBodyWithLimit(request) {
  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return { tooLarge: true };
  }

  if (!request.body) {
    return { text: "" };
  }

  const reader = request.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel("Request body too large");
        return { tooLarge: true };
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { text: new TextDecoder().decode(combined) };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const url = new URL(request.url);

    // CORS is a browser access control, not authentication. Requests without
    // an Origin header (for example, server-to-server tests) remain possible.
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return errorResponse(403, "Origin not allowed.", origin);
    }

    if (url.pathname !== "/api/chat") {
      return errorResponse(404, "Not found.", origin);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders(origin),
          "Cache-Control": "no-store",
        },
      });
    }

    if (request.method !== "POST") {
      return errorResponse(405, "Method not allowed. Use POST.", origin, {
        Allow: "POST, OPTIONS",
      });
    }

    const contentType = request.headers.get("Content-Type") || "";
    const mediaType = contentType.split(";")[0].trim().toLowerCase();
    if (mediaType !== "application/json") {
      return errorResponse(415, "Content-Type must be application/json.", origin);
    }

    let rawBody;
    try {
      const result = await readBodyWithLimit(request);
      if (result.tooLarge) {
        return errorResponse(413, "Request body is too large.", origin);
      }
      rawBody = result.text;
    } catch {
      return errorResponse(400, "Could not read request body.", origin);
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return errorResponse(400, "Invalid JSON body.", origin);
    }

    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      return errorResponse(400, "Request body must be a JSON object.", origin);
    }

    if (typeof body.message !== "string") {
      return errorResponse(400, "The message field must be a string.", origin);
    }

    const message = body.message.trim();
    if (!message) {
      return errorResponse(400, "Please type a message first.", origin);
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return errorResponse(
        413,
        "Please keep your message under 2,000 characters.",
        origin,
      );
    }

    if (!env.GEMINI_API_KEY) {
      return errorResponse(503, "AI service is not configured.", origin);
    }

    const geminiBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      GEMINI_TIMEOUT_MS,
    );

    try {
      const geminiResponse = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY,
        },
        body: JSON.stringify(geminiBody),
        signal: controller.signal,
      });

      // Keep the timeout active until the response body has been consumed.
      const rawResponse = await geminiResponse.text();
      let geminiData = {};
      try {
        geminiData = JSON.parse(rawResponse);
      } catch {
        // A non-JSON provider response is handled as a generic provider error.
      }

      if (!geminiResponse.ok) {
        const providerCode =
          geminiData?.error?.status ||
          geminiData?.error?.code ||
          "unknown";
        console.error(
          "Gemini request failed:",
          geminiResponse.status,
          providerCode,
        );

        if (geminiResponse.status === 429) {
          return errorResponse(
            429,
            "Gemini is temporarily rate-limited. Please try again shortly.",
            origin,
          );
        }

        return errorResponse(
          502,
          "Gemini could not complete that request. Please try again later.",
          origin,
        );
      }

      const reply = geminiData?.candidates?.[0]?.content?.parts
        ?.map((part) => (typeof part.text === "string" ? part.text : ""))
        .join("")
        .trim();

      if (!reply) {
        const finishReason =
          geminiData?.candidates?.[0]?.finishReason || "unknown";
        console.error("Gemini returned no text. Finish reason:", finishReason);
        return errorResponse(
          502,
          "Gemini returned an empty response. Please try again.",
          origin,
        );
      }

      return jsonResponse(200, { reply }, origin);
    } catch (error) {
      const isTimeout = error?.name === "AbortError";
      console.error(
        "Gemini chat request failed:",
        isTimeout ? "TimeoutError" : error?.name || "UnknownError",
      );

      return errorResponse(
        isTimeout ? 504 : 502,
        isTimeout
          ? "Gemini took too long to respond. Please try again."
          : "Gemini is temporarily unreachable. Please try again.",
        origin,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
