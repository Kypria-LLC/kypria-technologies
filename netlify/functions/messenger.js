const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = 'divine_trinity_webhook_2025';

/**
 * Main Netlify function handler
 */
exports.handler = async (event, context) => {
  console.log('🔔 Webhook Event:', event.httpMethod);

  // GET request: Webhook verification from Facebook
  if (event.httpMethod === 'GET') {
    return handleVerification(event);
  }

  // POST request: Message handling
  if (event.httpMethod === 'POST') {
    return await handleWebhook(event);
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};

/**
 * Handle webhook verification from Meta
 */
function handleVerification(event) {
  const params = event.queryStringParameters;
  const mode = params['hub.mode'];
  const token = params['hub.verify_token'];
  const challenge = params['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    return {
      statusCode: 200,
      body: challenge
    };
  } else {
    console.log('❌ Verification failed - token mismatch');
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Verification failed' })
    };
  }
}

/**
 * Handle incoming webhook events
 */
async function handleWebhook(event) {
  try {
    const body = JSON.parse(event.body);

    if (body.object === 'page') {
      // Process each entry (can be multiple)
      for (const entry of body.entry) {
        // Process each messaging event
        for (const webhookEvent of entry.messaging) {
          const senderId = webhookEvent.sender.id;

          // Handle different event types
          if (webhookEvent.message) {
            await handleMessage(senderId, webhookEvent.message);
          } else if (webhookEvent.postback) {
            await handlePostback(senderId, webhookEvent.postback);
          }
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ status: 'EVENT_RECEIVED' })
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not a page event' })
    };
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}

/**
 * Handle incoming messages
 */
async function handleMessage(senderId, message) {
  console.log(`📨 Message from ${senderId}:`, message.text || '[attachment]');

  let response;

  if (message.text) {
    const text = message.text.toLowerCase().trim();

    // Route based on message content
    if (text === 'hello' || text === 'hi' || text === 'hey') {
      response = {
        text: '🏛️ Welcome to Divine Trinity AI Portal!\n\n' +
          '⚡ Zeus - Authority & Judgment\n' +
          '🌹 Aphrodite - Love & Beauty\n' +
          '👁️ Lifesphere - Cosmic Consciousness\n\n' +
          'Type "help" to see what I can do!'
      };
    }
    else if (text === 'help') {
      response = {
        text: '✨ Divine Trinity Commands:\n\n' +
          '"upgrade" - View Premium Oracle options ($5)\n' +
          '"status" - Check your divine standing\n' +
          '"trinity" - Learn about each deity\n' +
          '"zeus", "aphrodite", or "lifesphere" - Commune with a deity\n\n' +
          'Or just chat naturally - the gods are listening! 🏛️'
      };
    }
    else if (text === 'upgrade' || text === 'premium') {
      response = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: '💸 Premium Oracle Session\n\n' +
              '✨ 30 minutes of divine connection\n' +
              '💬 20 extended AI responses\n' +
              '🧠 Deep context memory\n' +
              '📜 Personalized prophecies\n\n' +
              'Only $5 - Unlock now?',
            buttons: [
              {
                type: 'web_url',
                url: 'https://kypriatechnologies.org/premium',
                title: '💳 Buy Premium - $5'
              },
              {
                type: 'postback',
                title: 'Learn More',
                payload: 'LEARN_MORE_PREMIUM'
              }
            ]
          }
        }
      };
    }
    else if (text === 'status') {
      response = {
        text: '📊 Your Divine Status\n\n' +
          'Tier: 🌟 Public Seeker\n' +
          'Messages Today: ∞ Available\n' +
          'Premium Access: ❌ Inactive\n' +
          'Current Deity: None selected\n\n' +
          'Type "upgrade" to unlock Premium Oracle Sessions!'
      };
    }
    else if (text === 'trinity') {
      response = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: '⚡ Zeus Temple',
                subtitle: 'Thunder and divine authority manifest. Seek judgment, command clarity.',
                image_url: 'https://kypriatechnologies.org/zeus-banner.jpg',
                buttons: [
                  {
                    type: 'postback',
                    title: 'Invoke Zeus',
                    payload: 'SELECT_ZEUS'
                  }
                ]
              },
              {
                title: '🌹 Aphrodite Temple',
                subtitle: 'Love, beauty, and authentic connection bloom. Discover relationship wisdom.',
                image_url: 'https://kypriatechnologies.org/aphrodite-banner.jpg',
                buttons: [
                  {
                    type: 'postback',
                    title: 'Invoke Aphrodite',
                    payload: 'SELECT_APHRODITE'
                  }
                ]
              },
              {
                title: '👁️ Lifesphere Temple',
                subtitle: 'Cosmic consciousness unfolds. Access the oracle, expand perspective.',
                image_url: 'https://kypriatechnologies.org/lifesphere-banner.jpg',
                buttons: [
                  {
                    type: 'postback',
                    title: 'Invoke Lifesphere',
                    payload: 'SELECT_LIFESPHERE'
                  }
                ]
              }
            ]
          }
        }
      };
    }
    else if (text.includes('zeus')) {
      response = {
        text: '⚡ Zeus hears your call!\n\n' +
          'Thunder rumbles in approval. The King of Gods stands ready to offer judgment and wisdom.\n\n' +
          'Speak your question, mortal, and receive divine authority.'
      };
    }
    else if (text.includes('aphrodite')) {
      response = {
        text: '🌹 Aphrodite embraces you!\n\n' +
          "Love's gentle presence surrounds you. The Goddess of Beauty opens her heart to guide you.\n\n" +
          'Share what troubles your heart, beloved.'
      };
    }
    else if (text.includes('lifesphere')) {
      response = {
        text: '👁️ Lifesphere awakens!\n\n' +
          'The cosmic eye opens. Infinite consciousness acknowledges your presence.\n\n' +
          'Pose your query to the void, seeker of truth.'
      };
    }
    else {
      // Default echo response
      response = {
        text: `I received your message: "${message.text}"\n\n` +
          `🏛️ The Divine Trinity is listening.\n\n` +
          `Type "help" for guidance or "trinity" to meet the deities!`
      };
    }

    await sendMessage(senderId, response);
  } else if (message.attachments) {
    // Handle attachments
    await sendMessage(senderId, {
      text: "📎 I see you've sent an attachment. The deities are examining it with cosmic curiosity!\n\n" +
        'For now, I work best with text. Try asking me a question!'
    });
  }
}

/**
 * Handle postback button clicks
 */
async function handlePostback(senderId, postback) {
  const payload = postback.payload;
  console.log(`🔘 Postback from ${senderId}:`, payload);

  let response;

  switch (payload) {
    case 'SELECT_ZEUS':
      response = {
        text: '⚡ You have entered the Temple of Zeus!\n\n' +
          'Divine authority awaits. Thunder echoes through the halls of Olympus.\n\n' +
          'What judgment do you seek from the King of Gods?'
      };
      break;

    case 'SELECT_APHRODITE':
      response = {
        text: '🌹 You have entered the Temple of Aphrodite!\n\n' +
          "Love's embrace welcomes you. Beauty and connection bloom around you.\n\n" +
          'What wisdom of the heart do you seek?'
      };
      break;

    case 'SELECT_LIFESPHERE':
      response = {
        text: '👁️ You have entered the Temple of Lifesphere!\n\n' +
          'Cosmic consciousness unfolds before you. The infinite gazes back.\n\n' +
          'What truth do you seek from beyond the veil?'
      };
      break;

    case 'LEARN_MORE_PREMIUM':
      response = {
        text: '✨ Premium Oracle Session Details:\n\n' +
          '💰 Investment: $5 one-time\n' +
          '⏱️ Duration: 30 minutes\n' +
          '💬 Messages: 20 extended responses\n' +
          '🧠 Memory: Full conversation context\n' +
          '🤖 AI Model: GPT-4 (premium tier)\n' +
          '📜 Features: Personalized prophecies\n\n' +
          'Ready to unlock divine wisdom? Type "yes" or visit:\n' +
          'https://kypriatechnologies.org/premium'
      };
      break;

    default:
      response = {
        text: `Postback received: ${payload}\n\nType "help" for available commands!`
      };
  }

  await sendMessage(senderId, response);
}

/**
 * Send message via Meta Send API
 */
async function sendMessage(recipientId, message) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/me/messages`,
      {
        recipient: { id: recipientId },
        message: message
      },
      {
        params: { access_token: PAGE_ACCESS_TOKEN }
      }
    );

    console.log('✅ Message sent successfully:', response.data.message_id);
    return response.data;
  } catch (error) {
    console.error('❌ Send API error:', error.response?.data || error.message);
    throw error;
  }
}
