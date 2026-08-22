const axios = require('axios');

const draftReply = async (req, res) => {
  try {
    const { originalMessage } = req.body;
    
    if (!originalMessage) {
      return res.status(400).json({ message: 'Missing original message' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'GROQ_API_KEY is not configured in .env' });
    }

    const systemPrompt = 'You are a normal person chatting casually in a Slack-like app. Write a friendly, natural, and concise reply to the message. Speak entirely in the first person as the user. NEVER act like an AI or customer service bot. Do not use quotes or prefixes.';

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Draft a reply to this message:\n\n${originalMessage}`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    let draftText = response.data.choices[0].message.content;
    
    // Safely check if draftText exists and trim it, otherwise use a fun fallback
    if (typeof draftText === 'string' && draftText.trim()) {
      draftText = draftText.trim();
    } else {
      draftText = "(Sorry, I couldn't think of a response.)";
    }

    res.json({ draft: draftText });

  } catch (error) {
    const groqError = error.response?.data?.error?.message || error.message;
    console.error('AI Draft Error:', error.response?.data || error.message);
    res.status(500).json({ message: `Groq API Error: ${groqError}` });
  }
};

module.exports = {
  draftReply
};
