// netlify/functions/setup-messenger-profile.js
// Divine Trinity Messenger Bot - Messenger Profile API Configuration
// Kypria Studios / Basilica Codex

const axios = require("axios");

exports.handler = async (event, context) => {
  // Allow both GET and POST for easy testing
  if (event.httpMethod !== "POST" && event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed. Use GET or POST." }),
    };
  }

  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
  if (!PAGE_ACCESS_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Missing PAGE_ACCESS_TOKEN environment variable",
        note: "Configure this in Netlify dashboard: Site settings > Environment variables"
      }),
    };
  }

  const graphUrl = "https://graph.facebook.com/v18.0/me/messenger_profile";

  // 🌩️ DIVINE TRINITY MESSENGER PROFILE CONFIGURATION
  const payload = {
    // Get Started Button - triggers when user first opens chat
    get_started: {
      payload: "ZEUS_GET_STARTED",
    },

    // Ice Breakers - appear before first message, guide users to key actions
    ice_breakers: [
      {
        question: "What is the Divine Trinity?",
        payload: "ICE_BREAKER_TRINITY",
      },
      {
        question: "Show me Basilica Codex tiers",
        payload: "ICE_BREAKER_PATRON_TIERS",
      },
      {
        question: "How do I begin my first ritual?",
        payload: "ICE_BREAKER_FIRST_RITUAL",
      },
      {
        question: "Connect me with Zeus, the Steward",
        payload: "ICE_BREAKER_SUMMON_ZEUS",
      },
    ],

    // Greeting Text - shown when user first opens chat
    greeting: [
      {
        locale: "default",
        text:
          "⚡ Welcome to the Divine Trinity Messenger Bot by Kypria Studios. " +
          "I am Zeus, your guide through the Basilica Codex, patron tiers, and sacred automations. " +
          "Tap Get Started to begin your ritual.",
      },
    ],

    // Persistent Menu - always available navigation (hamburger menu)
    persistent_menu: [
      {
        locale: "default",
        composer_input_disabled: false, // Allow users to type freely
        call_to_actions: [
          {
            type: "postback",
            title: "🌩 Talk to Zeus (Guide me)",
            payload: "MENU_TALK_TO_ZEUS",
          },
          {
            type: "postback",
            title: "📜 Basilica Codex (Tiers)",
            payload: "MENU_BASILICA_TIERS",
          },
          {
            type: "postback",
            title: "🏛 Kypria Studios (About)",
            payload: "MENU_ABOUT_KYPRIA",
          },
        ],
      },
    ],
  };

  try {
    console.log("🔱 Configuring Divine Trinity Messenger Profile...");
    
    const response = await axios.post(
      graphUrl,
      payload,
      {
        params: { access_token: PAGE_ACCESS_TOKEN },
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("✅ Messenger Profile configured successfully");
    console.log("Facebook API Response:", response.data);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        message: "⚡ Divine Trinity Messenger Profile configured successfully",
        configuration: {
          get_started: "ZEUS_GET_STARTED",
          ice_breakers: 4,
          greeting: "Configured",
          persistent_menu: 3,
        },
        fb_response: response.data,
        next_steps: [
          "Test the bot at https://m.me/705565335971937",
          "Verify Get Started button appears for new users",
          "Check persistent menu (hamburger icon) in Messenger",
          "Update messenger.js to handle the new payloads",
        ],
      }),
    };
  } catch (error) {
    console.error("❌ Error configuring Messenger Profile:", error.response?.data || error.message);
    
    return {
      statusCode: error.response?.status || 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: "Failed to configure Messenger Profile",
        details: error.response?.data || error.message,
        troubleshooting: [
          "Verify PAGE_ACCESS_TOKEN is valid and not expired",
          "Ensure the token has 'pages_messaging' permission",
          "Check Facebook App is not in development mode restrictions",
          "Verify Page ID matches the token's page",
        ],
      }),
    };
  }
};
