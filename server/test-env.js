require('dotenv').config();

// Simple environment variable test
console.log('🔍 Environment Variable Check');
console.log('============================');

// Check required variables
const requiredVars = {
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
};

let allGood = true;

Object.entries(requiredVars).forEach(([key, value]) => {
  if (value) {
    if (key === 'GROQ_API_KEY') {
      // Don't show the full API key for security
      const masked =
        value.substring(0, 8) + '...' + value.substring(value.length - 4);
      console.log(`✅ ${key}: ${masked}`);

      // Validate format
      if (!value.startsWith('gsk_')) {
        console.log(`❌ ${key}: Invalid format - should start with 'gsk_'`);
        allGood = false;
      }
    } else {
      console.log(`✅ ${key}: ${value}`);
    }
  } else {
    console.log(`❌ ${key}: NOT SET`);
    allGood = false;
  }
});

console.log('\n📊 Summary:');
if (allGood) {
  console.log('✅ All required environment variables are set correctly!');
} else {
  console.log('❌ Some environment variables are missing or invalid.');
  console.log('\n🔧 To fix:');
  console.log('1. Go to your Render dashboard');
  console.log('2. Navigate to your service: ai-workflow-server');
  console.log('3. Click "Environment" tab');
  console.log('4. Add GROQ_API_KEY with your Groq Cloud API key');
  console.log('5. Redeploy the service');
}

console.log('\n🌐 Current environment:', process.env.NODE_ENV || 'development');
console.log('🚀 Server port:', process.env.PORT || '3001');
