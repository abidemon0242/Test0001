const ALLOWED_ORIGINS = new Set([
  'https://test0001-tau.vercel.app',
  'https://test0001-abid-s-studio.vercel.app',
  'https://abidemon0242.github.io'
]);

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const sameOrigin = Boolean(origin && req.headers.host && origin === `https://${req.headers.host}`);
  const originAllowed = !origin || ALLOWED_ORIGINS.has(origin) || sameOrigin;

  if (origin && originAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    if (!originAllowed) return res.status(403).json({ error: 'Origin not allowed.' });
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!originAllowed) return res.status(403).json({ error: 'Origin not allowed.' });

  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  if (!message) return res.status(400).json({ error: 'Please type a message first.' });
  if (message.length > 2000) return res.status(413).json({ error: 'Please keep your message under 2,000 characters.' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Chat configuration error: GEMINI_API_KEY is not configured.');
    return res.status(503).json({ error: 'Gemini is not configured for this deployment.' });
  }

  const salesPrompt = `You are the helpful sales assistant for Abid's Web Studio in Bangladesh.
Help visitors understand website services and submit an enquiry. Be concise, honest, and helpful.
Services include business websites, portfolio websites, landing pages, e-commerce websites, restaurant websites, and custom design.
Estimated packages:
- Basic 1-page website: around 2,500 BDT.
- Standard website with AI chatbot: 5,000-7,000 BDT.
- Advanced custom website with AI chatbot: 7,000-9,500 BDT.
Prices are estimates; the developer confirms the final price after reviewing requirements. Design and development are included. Hosting and payment processing are not included unless separately agreed.
Never invent deadlines, scarcity, guarantees, or customer testimonials. Ask one useful follow-up question. If the visitor wants to order, guide them to the order form or direct contact options. Keep answers to 2-4 short sentences.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: salesPrompt }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
      })
    });

    const raw = await response.text();
    let data = {};
    try { data = JSON.parse(raw); } catch {}

    if (!response.ok) {
      const providerCode = data?.error?.status || data?.error?.code || 'unknown';
      console.error('Gemini request failed:', response.status, providerCode);
      return res.status(response.status === 429 ? 429 : 502).json({
        error: response.status === 429
          ? 'Gemini is temporarily rate-limited. Please try again shortly.'
          : 'Gemini could not complete that request. Please check the API configuration and try again.'
      });
    }

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('')
      .trim();

    if (!reply) {
      console.error('Gemini returned no text. Finish reason:', data?.candidates?.[0]?.finishReason || 'unknown');
      return res.status(502).json({ error: 'Gemini returned an empty response. Please try again.' });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Gemini chat request failed:', error?.name || 'UnknownError');
    return res.status(error?.name === 'AbortError' ? 504 : 502).json({
      error: error?.name === 'AbortError'
        ? 'Gemini took too long to respond. Please try again.'
        : 'Gemini is temporarily unreachable. Please try again.'
    });
  } finally {
    clearTimeout(timeout);
  }
}
