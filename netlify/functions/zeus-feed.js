/**
 * zeus-feed.js — Social Proof: Facebook posts + Instagram media count
 * 
 * Endpoint: /api/zeus-feed
 * Env vars required:
 *   PAGE_ACCESS_TOKEN       — Facebook Page access token (can read page posts)
 *   META_SYSTEM_USER_TOKEN  — fallback: ZeusPublisher system user token (never expires)
 *   META_PAGE_ID            — 1058205557375892
 *   META_IG_USER_ID         — 17841480052164129
 * 
 * Returns latest 3 FB posts + IG media count in one call.
 * Fails soft — returns { ok: false } on any error so frontend degrades gracefully.
 * 
 * Uses Netlify Functions V1 (CommonJS) to match existing codebase pattern.
 */

const https = require('https');

function graphGet(path, token) {
  return new Promise((resolve, reject) => {
    const url = `https://graph.facebook.com/v22.0/${path}&access_token=${token}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON from Graph API'));
        }
      });
    }).on('error', reject);
  });
}

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=300, s-maxage=300' // 5-min CDN cache
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const token = process.env.PAGE_ACCESS_TOKEN || process.env.META_SYSTEM_USER_TOKEN;
  const pageId = process.env.META_PAGE_ID || '1058205557375892';
  const igUserId = process.env.META_IG_USER_ID || '17841480052164129';

  if (!token) {
    return {
      statusCode: 200, // Return 200 with ok:false so frontend degrades silently
      headers,
      body: JSON.stringify({ ok: false, error: 'Page token not configured' })
    };
  }

  try {
    // Parallel fetch: FB posts + IG media count + latest IG media
    const [fbData, igData] = await Promise.all([
      graphGet(`${pageId}/posts?fields=message,created_time,permalink_url&limit=3`, token),
      graphGet(`${igUserId}?fields=media_count,username,media.limit(1){media_url,thumbnail_url,media_type,timestamp,permalink}`, token)
    ]);

    const posts = (fbData.data || []).map(p => ({
      message: (p.message || '').substring(0, 200),
      created_time: p.created_time,
      permalink_url: p.permalink_url
    }));

    const instagram = {
      username: igData.username || 'godlyzeus.ai',
      media_count: igData.media_count || 0,
      latest: igData.media && igData.media.data && igData.media.data[0]
        ? {
            media_url: igData.media.data[0].media_url || igData.media.data[0].thumbnail_url,
            permalink: igData.media.data[0].permalink,
            media_type: igData.media.data[0].media_type,
            timestamp: igData.media.data[0].timestamp
          }
        : null
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        facebook: { posts },
        instagram,
        cached_at: new Date().toISOString()
      })
    };
  } catch (err) {
    console.error('zeus-feed error:', err.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: false, error: 'API fetch failed' })
    };
  }
};
