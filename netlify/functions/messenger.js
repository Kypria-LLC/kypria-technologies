// netlify/functions/messenger.js
// Divine Trinity Messenger Bot — Unified Webhook Handler
// Handles verification, messages, and postbacks

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER — Routes GET (verification) and POST (events)
// ═══════════════════════════════════════════════════════════════

exports.handler = async (event, context) => {
  console.log('⚡ Webhook invoked:', event.httpMethod);

  // ─────────────────────────────────────────────────────────────
  // GET REQUEST: Webhook Verification
  // ─────────────────────────────────────────────────────────────
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters;
    const mode = params['hub.mode'];
    const token = params['hub.verify_token'];
    const challenge = params['hub.challenge'];

    console.log('🔍 Verification attempt:', { mode, token });

    if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
      console.log('✅ WEBHOOK VERIFIED');
      return {
        statusCode: 200,
        body: challenge
      };
    } else {
      console.error('❌ Verification failed — token mismatch');
      return {
        statusCode: 403,
        body: 'Forbidden'
      };
    }
  }

  // ─────────────────────────────────────────────────────────────
  // POST REQUEST: Webhook Events (messages, postbacks, etc.)
  // ─────────────────────────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    let body;

    try {
      body = JSON.parse(event.body);
    } catch (error) {
      console.error('❌ Invalid JSON body:', error);
      return {
        statusCode: 400,
        body: 'Invalid JSON'
      };
    }

    console.log('📨 Webhook event received:', JSON.stringify(body, null, 2));

    // Verify this is a page event
    if (body.object !== 'page') {
      console.warn('⚠️ Non-page event received');
      return {
        statusCode: 404,
        body: 'Not Found'
      };
    }

    // Process all messaging events
    for (const entry of body.entry) {
      for (const webhook_event of entry.messaging) {
        const sender_psid = webhook_event.sender.id;

        // Handle text messages
        if (webhook_event.message) {
          await handleMessage(sender_psid, webhook_event.message);
        }
        // Handle postback events (button clicks)
        else if (webhook_event.postback) {
          await handlePostback(sender_psid, webhook_event.postback);
        }
      }
    }

    // Always return 200 to acknowledge receipt
    return {
      statusCode: 200,
      body: 'EVENT_RECEIVED'
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Unsupported method
  // ─────────────────────────────────────────────────────────────
  return {
    statusCode: 405,
    body: 'Method Not Allowed'
  };
};

// ═══════════════════════════════════════════════════════════════
// MESSAGE HANDLER — Processes text input from users
// ═══════════════════════════════════════════════════════════════

async function handleMessage(sender_psid, received_message) {
  console.log('💬 Message received from:', sender_psid);
  let response;

  // Handle text messages
  if (received_message.text) {
    const text = received_message.text.toLowerCase();
    console.log('📝 Message text:', text);

    // Intent detection — Sacred Works / Portfolio
    if (text.includes('portfolio') || text.includes('work') || text.includes('gallery')) {
      response = {
        text: "🎨 BEHOLD THE SACRED WORKS\\n\\n" +
          "Visit the Basilica Codex to witness our divine portfolio:\\n" +
          "https://kypriastudios.com\\n\\n" +
          "Each creation is a testament to mythic precision and operational excellence."
      };
    }
    // Intent detection — Commission / Hire
    else if (text.includes('commission') || text.includes('hire') || text.includes('project')) {
      response = {
        text: "⚡ TO COMMISSION THE DIVINE TRINITY:\\n\\n" +
          "Speak your vision clearly, and Zeus shall assess its worthiness.\\n\\n" +
          "For formal inquiry, visit:\\n" +
          "https://kypriastudios.com/contact\\n\\n" +
          "Or describe your need here, and we shall guide you."
      };
    }
    // Intent detection — About / Canon / Lore
    else if (text.includes('about') || text.includes('canon') || text.includes('lore') || text.includes('who')) {
      response = {
        text: "📜 THE KYPRIA STUDIOS CANON\\n\\n" +
          "Born from the intersection of mythology and technology, " +
          "Kypria Studios forges digital experiences worthy of the gods.\\n\\n" +
          "Our craft spans:\\n" +
          "⚡ Mythic Branding & Identity\\n" +
          "🎨 Sacred Digital Art\\n" +
          "🏛️ Ceremonial Web Architecture\\n" +
          "📜 Living Documentation Systems\\n\\n" +
          "Every creation is bound by precision, resonance, and timeless design."
      };
    }
    // Default response — Acknowledge and guide
    else {
      response = {
        text: "⚡ Zeus hears your words, mortal.\\n\\n" +
          "For structured guidance, invoke the menu (☰).\\n" +
          "For direct inquiry, speak your purpose clearly:\\n\\n" +
          "• Portfolio & Sacred Works\\n" +
          "• Commission Inquiry\\n" +
          "• About Kypria Studios"
      };
    }
  }
  // Handle attachments (images, files, etc.)
  else if (received_message.attachments) {
    response = {
      text: "⚡ Zeus acknowledges your offering.\\n\\n" +
        "Attachments received. Describe your intent, and we shall interpret."
    };
  }

  await callSendAPI(sender_psid, response);
}

// ═══════════════════════════════════════════════════════════════
// POSTBACK HANDLER — Processes button clicks and menu selections
// ═══════════════════════════════════════════════════════════════

async function handlePostback(sender_psid, postback) {
  const payload = postback.payload;
  const title = postback.title;

  console.log('🔘 Postback received:', {
    sender: sender_psid,
    payload: payload,
    title: title
  });

  let response;

  switch (payload) {
    // ─────────────────────────────────────────────────────────
    // Get Started button — First contact greeting
    // ─────────────────────────────────────────────────────────
    case 'ZEUS_GET_STARTED':
      response = {
        text: "⚡ WELCOME, SEEKER.\\n\\n" +
          "You stand before the Divine Trinity of Kypria Studios — " +
          "where myth meets mastery, and vision becomes form.\\n\\n" +
          "Choose your path:\\n\\n" +
          "🎨 Sacred Works — Behold the portfolio\\n" +
          "📜 The Canon — Learn our philosophy\\n" +
          "💬 Speak Freely — Engage directly with Zeus\\n\\n" +
          "Or use the menu (☰) for guided navigation.",
        quick_replies: [
          {
            content_type: "text",
            title: "🎨 View Portfolio",
            payload: "VIEW_PORTFOLIO"
          },
          {
            content_type: "text",
            title: "📜 Learn More",
            payload: "ABOUT_CANON"
          },
          {
            content_type: "text",
            title: "💬 Commission Work",
            payload: "COMMISSION_INQUIRY"
          }
        ]
      };
      break;

    // ─────────────────────────────────────────────────────────
    // Main Menu — Central navigation hub
    // ─────────────────────────────────────────────────────────
    case 'MAIN_MENU':
      response = {
        text: "⚡ THE OLYMPIAN COUNCIL AWAITS.\\n\\n" +
          "State your inquiry:",
        quick_replies: [
          {
            content_type: "text",
            title: "🎨 Sacred Works",
            payload: "VIEW_PORTFOLIO"
          },
          {
            content_type: "text",
            title: "💬 Commission",
            payload: "COMMISSION_INQUIRY"
          },
          {
            content_type: "text",
            title: "📜 About Us",
            payload: "ABOUT_CANON"
          }
        ]
      };
      break;

    // ─────────────────────────────────────────────────────────
    // About / Canon / Lore
    // ─────────────────────────────────────────────────────────
    case 'ABOUT_CANON':
      response = {
        text: "📜 THE KYPRIA STUDIOS CANON\\n\\n" +
          "Born from the intersection of mythology and technology, " +
          "Kypria Studios forges digital experiences worthy of the gods.\\n\\n" +
          "Our craft spans:\\n" +
          "⚡ Mythic Branding & Identity\\n" +
          "🎨 Sacred Digital Art\\n" +
          "🏛️ Ceremonial Web Architecture\\n" +
          "📜 Living Documentation Systems\\n\\n" +
          "Every creation is bound by precision, resonance, and timeless design.\\n\\n" +
          "Learn more: https://kypriastudios.com"
      };
      break;

    // ─────────────────────────────────────────────────────────
    // Portfolio / Sacred Works
    // ─────────────────────────────────────────────────────────
    case 'VIEW_PORTFOLIO':
      response = {
        text: "🎨 BEHOLD THE SACRED WORKS\\n\\n" +
          "Visit the Basilica Codex to witness our portfolio:\\n" +
          "https://kypriastudios.com\\n\\n" +
          "Each project is a testament to mythic precision and operational excellence."
      };
      break;

    // ─────────────────────────────────────────────────────────
    // Commission Inquiry
    // ─────────────────────────────────────────────────────────
    case 'COMMISSION_INQUIRY':
      response = {
        text: "⚡ TO COMMISSION THE DIVINE TRINITY:\\n\\n" +
          "Describe your vision here, or visit our formal inquiry portal:\\n" +
          "https://kypriastudios.com/contact\\n\\n" +
          "Zeus listens. Speak your purpose, mortal."
      };
      break;

    // ─────────────────────────────────────────────────────────
    // Fallback — Unrecognized payload
    // ─────────────────────────────────────────────────────────
    default:
      console.warn('⚠️ Unrecognized payload:', payload);
      response = {
        text: "⚡ Zeus does not recognize this invocation.\\n\\n" +
          "Use the menu (☰) for guided navigation, or speak your purpose plainly."
      };
  }

  await callSendAPI(sender_psid, response);
}

// ═══════════════════════════════════════════════════════════════
// SEND API — Delivers messages back to the user
// ═══════════════════════════════════════════════════════════════

async function callSendAPI(sender_psid, response) {
  const request_body = {
    recipient: {
      id: sender_psid
    },
    message: response
  };

  console.log('📤 Sending message to:', sender_psid);

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request_body)
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ Send API Error:', {
        status: res.status,
        statusText: res.statusText,
        error: data.error
      });
    } else {
      console.log('✅ Message sent successfully:', data);
    }

    return data;
  } catch (error) {
    console.error('❌ Send API Exception:', error);
    throw error;
  }
}
