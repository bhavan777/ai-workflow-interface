// Simple test script to verify Vercel setup
const { spawn } = require('child_process');

console.log('🚀 Testing Vercel setup...');

// Test if vercel is installed
const vercelTest = spawn('npx', ['vercel', '--version'], { stdio: 'pipe' });

vercelTest.on('close', code => {
  if (code === 0) {
    console.log('✅ Vercel CLI is available');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npx vercel login');
    console.log('2. Run: npx vercel --prod');
    console.log('3. Set GROQ_API_KEY environment variable in Vercel dashboard');
    console.log('4. Update client WebSocket URL to your Vercel deployment URL');
  } else {
    console.log('❌ Vercel CLI not found. Installing...');
    const install = spawn('npm', ['install', '-g', 'vercel'], {
      stdio: 'inherit',
    });
    install.on('close', code => {
      if (code === 0) {
        console.log('✅ Vercel CLI installed successfully');
      } else {
        console.log('❌ Failed to install Vercel CLI');
      }
    });
  }
});
