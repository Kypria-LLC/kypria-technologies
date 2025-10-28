exports.handler = async (event) => {
  const params = event.queryStringParameters;
  if (
    params['hub.mode'] === 'subscribe' &&
    params['hub.verify_token'] === 'ZEUS_THUNDER_2025'
  ) {
    return {
      statusCode: 200,
      body: params['hub.challenge']
    };
  }
  return {
    statusCode: 403,
    body: 'Forbidden'
  };
};