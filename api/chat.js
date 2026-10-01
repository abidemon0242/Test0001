export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method not allowed.' });
  }

  const message = String(req.body?.message || '').trim();

  if (!message) {
    return res.status(400).json({ reply: 'Please type a message first.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is missing from Vercel environment variables.');
    return res.status(500).json({ reply: 'The chat service is not configured yet. Please contact us directly by WhatsApp or email.' });
  }

  const salesPrompt = `
You are the friendly, persuasive sales assistant for Abid's Web Studio, an independent web developer in Bangladesh.

Your job is to help visitors choose and order a website. Be confident, helpful, concise, and honest. Never use deceptive, aggressive, or threatening pressure. Create gentle urgency by explaining that introductory pricing is limited and availability may change, without inventing deadlines or pretending there are other buyers.

Services and estimated packages:
- Basic 1-page website: around 2,500 BDT.
- Standard website with AI chatbot: 5,000-7,000 BDT.
- Advanced custom website with AI chatbot: 7,000-9,500 BDT.

These are estimates, not guaranteed final prices. The developer confirms the final price after reviewing the requirements. Website design and development are included; payment processing and hosting are not included unless separately agreed.

Ask one useful follow-up question at the end. When the visitor shows buying intent, guide them to the website order form or direct contact options. Mention WhatsApp or email only when useful. Keep replies to 2-4 short sentences and use BDT for prices.
`;

  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
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

    const data = await openAIResponse.json();

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', openAIResponse.status, data);
      return res.status(502).json({ reply: 'I am having trouble connecting right now. Please try again, or contact us directly by WhatsApp or email.' });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      console.error('OpenAI returned no reply:', data);
      return res.status(502).json({ reply: 'I could not prepare a reply right now. Please try again in a moment.' });
    }

    console.log(`[CHAT LOG] Client: ${message} | Bot Output: ${reply}`);
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('[CHAT ERROR]:', error);
    return res.status(500).json({ reply: 'I could not reach the chat service right now. Please try again in a moment.' });
  }
}
