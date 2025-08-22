require('dotenv').config();

console.log('=== Environment Test ===');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 'NOT SET');
console.log('OPENAI_API_KEY starts with:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT SET');

if (!process.env.OPENAI_API_KEY) {
  console.log('❌ OPENAI_API_KEY is not set!');
  process.exit(1);
} else {
  console.log('✅ OPENAI_API_KEY is set correctly!');
}
