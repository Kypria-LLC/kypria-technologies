const config = require('./config');
exports.handler = async (event) => {
  const { code } = event.queryStringParameters || {};
  if (!code) return { statusCode: 400, body: 'No code' };
  try {
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${config.facebook.appId}&client_secret=${config.facebook.appSecret}&code=${code}&redirect_uri=${config.facebook.redirectUri}`;
    const response = await fetch(tokenUrl);
    const data = await response.json();
    return { statusCode: 302, headers: { 'Location': `${config.urls.dashboard}?connected=true` }, body: '' };
  } catch (error) { return { statusCode: 500, body: error.message }; }
};
