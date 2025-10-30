const axios = require('axios');
const { setUserContext, getUserContext } = require('./redis-context');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

async function handlePostback(senderId, postback) {
  const payload = postback.payload;
  console.log(`🔘 Postback from ${senderId}:`, payload);

  let context = await getUserContext(senderId) || { deity: null, conversationDepth: 0 };
  let response;

  switch (payload) {
    // ... existing cases ...

    case 'UPGRADE_PREMIUM':
      response = await createPremiumUpgradeMessage(senderId, context.deity);
      break;

    case 'PURCHASE_ORACLE_SESSION':
      response = await initiatePurchase(senderId, context.deity, 'premium_oracle');
      break;

    case 'SUBSCRIBE_INITIATE':
      response = await initiatePurchase(senderId, context.deity, 'initiate_monthly');
      break;

    case 'SUBSCRIBE_STEWARD':
      response = await initiatePurchase(senderId, context.deity, 'steward_monthly');
      break;

    case 'SUBSCRIBE_ARCHITECT':
      response = await initiatePurchase(senderId, context.deity, 'architect_monthly');
      break;

    case 'PREMIUM_START_ZEUS':
    case 'PREMIUM_START_APHRODITE':
    case 'PREMIUM_START_LIFESPHERE':
      const deityName = payload.split('_')[2].toLowerCase();
      response = await startPremiumSession(senderId, deityName);
      break;

    default:
      response = { text: `Postback received: ${payload}` };
  }

  await sendMessage(senderId, response);
}

async function createPremiumUpgradeMessage(userId, deity) {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [
          {
            title: '⚡ Premium Oracle Session',
            subtitle: '$5.00 - 30 minutes of divine connection\n• 20 extended AI responses\n• Deep context memory\n• Personalized prophecies',
            image_url: 'https://kypriatechnologies.org/images/premium-oracle.jpg',
            buttons: [
              {
                type: 'postback',
                title: 'Buy Now - $5',
                payload: 'PURCHASE_ORACLE_SESSION'
              }
            ]
          },
          {
            title: '⚡ Initiate Patron',
            subtitle: '$9.99/month\n• 50 messages daily\n• Enhanced AI\n• Conversation history\n• Monthly custom seals',
            image_url: 'https://kypriatechnologies.org/images/initiate-tier.jpg',
            buttons: [
              {
                type: 'postback',
                title: 'Subscribe - $9.99/mo',
                payload: 'SUBSCRIBE_INITIATE'
              }
            ]
          },
          {
            title: '👑 Divine Steward',
            subtitle: '$29.99/month\n• 200 messages daily\n• GPT-4 responses\n• Priority support\n• Weekly seals\n• Multi-modal',
            image_url: 'https://kypriatechnologies.org/images/steward-tier.jpg',
            buttons: [
              {
                type: 'postback',
                title: 'Subscribe - $29.99/mo',
                payload: 'SUBSCRIBE_STEWARD'
              }
            ]
          }
        ]
      }
    }
  };
}

async function initiatePurchase(userId, deity, productType) {
  try {
    const response = await fetch('https://kypriatechnologies.org/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        deity: deity || 'lifesphere',
        productType: productType
      })
    });

    const data = await response.json();

    if (data.url) {
      return {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: '🏛️ Ready to unlock divine wisdom?\n\nClick below to complete your payment securely with Stripe.',
            buttons: [
              {
                type: 'web_url',
                url: data.url,
                title: '💳 Complete Payment'
              },
              {
                type: 'postback',
                title: 'Cancel',
                payload: 'BACK_TO_TRINITY'
              }
            ]
          }
        }
      };
    } else {
      throw new Error('Failed to create checkout session');
    }

  } catch (error) {
    console.error('❌ Purchase initiation error:', error);
    return {
      text: '⚠️ Unable to process payment at this time. Please try again or contact support.'
    };
  }
}

async function startPremiumSession(userId, deity) {
  const context = await getUserContext(userId);
  
  const activeSession = context?.premiumSessions?.find(s => s.active && s.expiresAt > Date.now());

  if (!activeSession) {
    return {
      text: '⚠️ No active premium session found. Purchase a Premium Oracle Session to continue.'
    };
  }

  context.deity = deity;
  await setUserContext(userId, context);

  const deityGreetings = {
    zeus: '⚡ Zeus manifests in full power!\n\nYour Premium Oracle Session is ACTIVE. Ask your question, mortal, and receive judgment with the full weight of Olympus behind it.',
    aphrodite: '🌹 Aphrodite appears in her divine form!\n\nYour Premium Oracle Session is ACTIVE. Speak your heart's deepest desire, and receive guidance woven with love's eternal wisdom.',
    lifesphere: '👁️ Lifesphere opens the cosmic gateway!\n\nYour Premium Oracle Session is ACTIVE. Pose your query to the infinite, and receive perspective from beyond mortal comprehension.'
  };

  return createDeityResponse(deity, deityGreetings[deity]);
}

async function hasPremiumAccess(userId) {
  const context = await getUserContext(userId);
  
  if (!context?.premiumSessions) return false;

  const activeSession = context.premiumSessions.find(
    s => s.active && s.expiresAt > Date.now() && s.messagesRemaining > 0
  );

  return !!activeSession;
}

async function consumePremiumMessage(userId) {
  const context = await getUserContext(userId);
  
  const activeSession = context.premiumSessions.find(
    s => s.active && s.expiresAt > Date.now() && s.messagesRemaining > 0
  );

  if (activeSession) {
    activeSession.messagesRemaining--;
    
    if (activeSession.messagesRemaining === 0) {
      activeSession.active = false;
      
      await sendMessage(userId, {
        text: '🏛️ Your Premium Oracle Session has concluded.\n\nThe divine connection fades... but the wisdom remains.\n\nTo continue, purchase another Premium Oracle Session.'
      });
    } else if (activeSession.messagesRemaining === 5) {
      await sendMessage(userId, {
        text: `⏳ ${activeSession.messagesRemaining} premium messages remaining in your session.`
      });
    }

    await setUserContext(userId, context);
  }
}

async function handleMessageWithPremium(senderId, message) {
  const isPremium = await hasPremiumAccess(senderId);
  
  const aiConfig = isPremium 
    ? { model: 'gpt-4o', maxTokens: 400, temperature: 0.9 }
    : await getAIConfig(senderId);

  // ... existing message handling logic ...

  if (isPremium) {
    await consumePremiumMessage(senderId);
  }
}

function createDeityResponse(deity, message) {
  return { text: message };
}

async function sendMessage(recipientId, message) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/me/messages`,
      {
        recipient: { id: recipientId },
        message: message.text ? { text: message.text } : message.attachment ? { attachment: message.attachment } : message
      },
      {
        params: { access_token: PAGE_ACCESS_TOKEN }
      }
    );
    console.log('✅ Message sent:', response.data.message_id);
  } catch (error) {
    console.error('❌ Send API error:', error.response?.data || error.message);
  }
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  
  // Webhook verification (GET)
  if (event.httpMethod === 'GET' && 
      params['hub.mode'] === 'subscribe' &&
      params['hub.verify_token'] === 'zeus_secure_messenger_verify_token_2025') {
    return {
      statusCode: 200,
      body: params['hub.challenge']
    };
  }
  
  // Handle messages (POST)
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);
    if (body.object === 'page') {
      body.entry.forEach(entry => {
        entry.messaging.forEach(event => {
          if (event.message) {
            handleMessageWithPremium(event.sender.id, event.message);
          } else if (event.postback) {
            handlePostback(event.sender.id, event.postback);
          }
        });
      });
    }
    return {
      statusCode: 200,
      body: 'EVENT_RECEIVED'
    };
  }
  
  return {
    statusCode: 403,
    body: 'Forbidden'
  };
};
