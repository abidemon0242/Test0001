export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method not allowed.' });
  }

  const message = typeof req.body?.message === 'string'
    ? req.body.message.trim()
    : '';

  if (!message) {
    return res.status(400).json({ reply: 'Please type a message first.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('Missing OPENAI_API_KEY in the active Vercel deployment.');
    return res.status(500).json({
      reply: 'The chat service is not configured yet. Please contact us by WhatsApp or email.'
    });
  }

  const salesPrompt = `You are the friendly, persuasive sales assistant for Abid's Web Studio in Bangladesh.
Help visitors choose and order a website. Be concise, honest, and helpful. Use gentle urgency only: introductory pricing is available for a limited time, but never invent deadlines, scarcity, or other buyers.

Estimated packages:
- Basic 1-page website: around 2,500 BDT.
- Standard website with AI chatbot: 5,000-7,000 BDT.
- Advanced custom website with AI chatbot: 7,000-9,500 BDT.

Prices are estimates; the developer confirms the final price after reviewing requirements. Design and development are included. Hosting and payment processing are not included unless separately agreed.
Ask one useful follow-up question. If the visitor wants to buy, guide them to the order form or direct contact options. Keep the answer to 2-4 short sentences.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
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
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = {};
    }

    if (!response.ok) {
      console.error('OpenAI request failed:', response.status, data?.error?.message || raw);
      return res.status(502).json({
        reply: 'The AI service rejected the request. Please try again shortly or contact us directly.'
      });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      console.error('OpenAI returned no message:', data);
      return res.status(502).json({
        reply: 'The AI service returned an empty response. Please try again.'
      });
    }

    console.log(`[CHAT LOG] ${message} -> ${reply}`);
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat function error:', error);
    return res.status(500).json({
      reply: 'I could not reach the chat service right now. Please try again in a moment.'
    });
  }
}
