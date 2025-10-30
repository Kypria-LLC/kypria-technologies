const fetch = require('node-fetch');
const { uploadToS3 } = require('./s3-utils');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_IDS = {
  zeus: 'pNInz6obpgDQGcFmaJgB', // Adam - deep, authoritative
  aphrodite: 'jsCqWAovK2LkecY7zXl4', // Bella - warm, elegant  
  lifesphere: 'flq6f7yk4E4fJM5XTYuZ' // Michael - ethereal
};

exports.handler = async (event) => {
  const { text, deity, userId, sessionId } = JSON.parse(event.body);
  
  // Generate audio
  const voiceId = VOICE_IDS[deity] || VOICE_IDS.zeus;
  const audioBuffer = await generateVoice(text, voiceId);
  
  // Upload to S3
  const audioUrl = await uploadToS3(audioBuffer, `oracles/${sessionId}.mp3`);
  
  // Send to user via IG
  // Placeholder for Instagram integration
  // const { sendInstagramReply } = require('./sendInstagramReply');
  // await sendInstagramReply(userId, {
  //   attachment: {
  //     type: 'audio',
  //     payload: { url: audioUrl }
  //   }
  // });
  
  console.log(`Successfully generated and uploaded oracle audio: ${audioUrl}`);
  
  return { statusCode: 200, body: JSON.stringify({ audioUrl }) };
};

async function generateVoice(text, voiceId) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`ElevenLabs API error: ${response.status} ${response.statusText}`, errorBody);
    throw new Error('Failed to generate voice from ElevenLabs.');
  }
  
  return Buffer.from(await response.arrayBuffer());
}