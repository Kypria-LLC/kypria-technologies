const AWS = require('aws-sdk');
const crypto = require('crypto');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.S3_ORACLE_BUCKET || 'divine-trinity-oracles';

/**
 * Upload audio buffer to S3 with proper headers
 * Returns the CloudFront URL for instant delivery
 */
async function uploadToS3(buffer, key) {
  // Add content hash for cache busting
  const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 8);
  const finalKey = key.replace('.mp3', `-${hash}.mp3`);
  
  const params = {
    Bucket: BUCKET_NAME,
    Key: finalKey,
    Body: buffer,
    ContentType: 'audio/mpeg',
    CacheControl: 'public, max-age=31536000', // 1 year
    Metadata: {
      'deity': key.split('/')[1] || 'unknown',
      'created': new Date().toISOString()
    }
  };
  
  await s3.upload(params).promise();
  
  // Return CloudFront URL if configured, else S3 URL
  const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
  if (cloudFrontDomain) {
    return `https://${cloudFrontDomain}/${finalKey}`;
  }
  
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${finalKey}`;
}

/**
 * Generate presigned URL for temporary access (backup method)
 */
async function getPresignedUrl(key, expiresIn = 3600) {
  return s3.getSignedUrlPromise('getObject', {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: expiresIn
  });
}

/**
 * Check if oracle already exists (for deduplication)
 */
async function oracleExists(key) {
  try {
    await s3.headObject({ Bucket: BUCKET_NAME, Key: key }).promise();
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = { uploadToS3, getPresignedUrl, oracleExists };