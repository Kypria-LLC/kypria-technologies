const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { topic, length, tone } = JSON.parse(event.body);
    
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'sk-ant-api03-f8mO5vEVvIs0rGbm8guTR2vqhVCYN6mBVKOnIpcwuZcLJsO4qhuw9GQ391X67PsZdMq0POnW_7SpnF4P0DldlA--7qPQQAA';
    const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
    
    const prompt = `Create a Twitter/X thread about "${topic}" with ${length} tweets.\nTone: ${tone}.\nFormat each tweet clearly numbered (1/, 2/, etc.) and ensure each tweet is under 280 characters.\nMake the thread engaging, valuable, and aligned with the mystical "Oracle" theme of Kypria Technologies.`;
    
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate thread', details: error.message })
    };
  }
};
