const ALLOWED_ORIGINS = new Set([
  'https://test0001-tau.vercel.app',
  'https://test0001-abid-s-studio.vercel.app',
  'https://abidemon0242.github.io'
]);

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return res.status(403).json({ error: 'Origin not allowed.' });
    }
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return res.status(403).json({ error: 'Origin not allowed.' });
  }

  const message = typeof req.body?.message === 'string'
    ? req.body.message.trim()
    : '';

  if (!message) {
    return res.status(400).json({ error: 'Please type a message first.' });
  }
  if (message.length > 2000) {
    return res.status(413).json({ error: 'Please keep your message under 2,000 characters.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Chat configuration error: OPENAI_API_KEY is not configured.');
    return res.status(503).json({
      error: 'The AI assistant is temporarily unavailable. Please contact us through WhatsApp or email.'
    });
  }

  const salesPrompt = `You are the helpful sales assistant for Abid's Web Studio in Bangladesh.
Help visitors understand website services and submit an enquiry. Be concise, honest, and helpful.
Estimated packages:
- Basic 1-page website: around 2,500 BDT.
- Standard website with AI chatbot: 5,000-7,000 BDT.
- Advanced custom website with AI chatbot: 7,000-9,500 BDT.
Prices are estimates; the developer confirms the final price after reviewing requirements. Design and development are included. Hosting and payment processing are not included unless separately agreed.
Never invent deadlines, scarcity, guarantees, or customer testimonials. Ask one useful follow-up question. If the visitor wants to order, guide them to the order form or direct contact options. Keep answers to 2-4 short sentences.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: salesPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 220
      })
    });

    const raw = await response.text();
    let data = {};
    try { data = JSON.parse(raw); } catch {}

    if (!response.ok) {
      // Log status and provider error code only; do not store visitors' messages or API credentials.
      console.error('OpenAI request failed:', response.status, data?.error?.code || data?.error?.type || 'unknown');
      return res.status(response.status === 429 ? 429 : 502).json({
        error: response.status === 429
          ? 'The AI assistant is busy. Please wait a moment and try again.'
          : 'The AI assistant could not complete that request. Please try again shortly.'
      });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      console.error('OpenAI returned an empty response.');
      return res.status(502).json({ error: 'The AI assistant returned an empty response. Please try again.' });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat function request failed:', error?.name || 'UnknownError');
    return res.status(error?.name === 'AbortError' ? 504 : 502).json({
      error: error?.name === 'AbortError'
        ? 'The AI assistant took too long to respond. Please try again.'
        : 'The AI assistant is temporarily unreachable. Please try again.'
    });
  } finally {
    clearTimeout(timeout);
  }
}
