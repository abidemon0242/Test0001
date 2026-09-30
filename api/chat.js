export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  const userQuery = message.toLowerCase();

  // --- BUSINESS PRICING & REQUIREMENTS LOGIC ---
  let estimatedPriceRange = "";
  
  if (userQuery.includes('one page') || userQuery.includes('single page') || userQuery.includes('no logo') || userQuery.includes('basic')) {
    estimatedPriceRange = "around 2,500 BDT";
  } else if (userQuery.includes('advanced') || userQuery.includes('custom features') || userQuery.includes('e-commerce') || userQuery.includes('portal')) {
    estimatedPriceRange = "between 7,000 to 9,500 BDT (including an AI chatbot)";
  } else if (userQuery.includes('chatbot') || userQuery.includes('ai') || userQuery.includes('standard')) {
    estimatedPriceRange = "between 5,000 to 7,000 BDT (with AI chatbot integration)";
  }

  // --- SYSTEM PROMPT (Persuasion + Pricing Estimation) ---
  const salesPrompt = `
You are an expert sales consultant for our web development service.
Our exact pricing packages:
1. Basic 1-Page Website (No Logo): 2,500 BDT
2. Standard Website with AI Chatbot: 5,000 BDT - 7,000 BDT
3. Advanced Custom Website with AI Chatbot: 7,000 BDT - 9,500 BDT

GUIDELINES:
- Understand customer requirements (features, pages, AI needs).
- Based on their requirements, offer a friendly ESTIMATE (e.g., "Based on what you need, your estimated package will be around...").
- Always clarify: "This is an estimated price range—our lead developer will review your exact requirements and confirm the final fixed price."
- Persuade using value and trust. Keep responses concise (2-3 sentences max) and end with 1 engaging question to gather more project details or offer a call.
`;

  try {
    let reply = "";

    // Route to ChatGPT (gpt-4o-mini) for handling complex requirements and estimates
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: salesPrompt },
          { role: 'user', content: `[SYSTEM NOTE: Calculated context estimate: ${estimatedPriceRange}]\nUser message: ${message}` }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    reply = data.choices[0].message.content;

    // --- LOGGING FOR YOU TO REVIEW ALL CHATS ---
    console.log(`[CHAT LOG] Client: ${message} | Bot Output: ${reply}`);

    return res.status(200).json({ reply });

  } catch (error) {
    console.error(`[CHAT ERROR]:`, error);
    return res.status(500).json({ error: 'Failed to process chat response.' });
  }
      }
