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
    console.log('⚡ Zeus receives:', event.body);
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