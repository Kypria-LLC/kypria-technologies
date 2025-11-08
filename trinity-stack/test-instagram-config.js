// test-instagram-config.js
// Simple test to verify Instagram token configuration

require('dotenv').config();

console.log('🏛️ Temple Instagram Configuration Test\n');

// Check if .env file is loaded
if (process.env.INSTAGRAM_ACCESS_TOKEN) {
  console.log('✅ .env file loaded successfully');
  console.log('✅ INSTAGRAM_ACCESS_TOKEN found');
  
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  console.log('\nToken length: ' + token.length + ' characters');
  console.log('Token starts with: ' + token.substring(0, 20) + '...');
  
  // Check token format
  if (token.startsWith('EAAF') || token.startsWith('IGQV')) {
    console.log('✅ Token format appears valid');
  } else {
    console.log('⚠️  Token format may be incorrect');
  }
  
  console.log('\n🎉 Configuration test passed!');
  console.log('\nNext steps:');
  console.log('1. Test API connection with a simple Instagram API call');
  console.log('2. Verify permissions are correct');
  console.log('3. Deploy to your Temple application');
  
} else {
  console.log('❌ INSTAGRAM_ACCESS_TOKEN not found');
  console.log('\nTroubleshooting:');
  console.log('1. Check if .env file exists in the project root');
  console.log('2. Verify .env file contains: INSTAGRAM_ACCESS_TOKEN=your_token');
  console.log('3. Make sure there are no spaces around the = sign');
  console.log('4. Restart your terminal/PowerShell');
}
