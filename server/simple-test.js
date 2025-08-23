const https = require('https');

const url =
  'https://nexla-4l2h2vy87-bhavan777s-projects.vercel.app/api/websocket';

console.log('🧪 Simple test of deployed endpoint...');
console.log(`🔗 URL: ${url}`);

const req = https.get(url, res => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`📄 Response: ${data}`);

    if (res.statusCode === 200) {
      console.log('✅ Endpoint is accessible!');
    } else if (res.statusCode === 401) {
      console.log(
        '⚠️ Endpoint requires authentication (GROQ_API_KEY might be missing)'
      );
    } else {
      console.log(`⚠️ Unexpected status: ${res.statusCode}`);
    }
  });
});

req.on('error', error => {
  console.error('❌ Request failed:', error.message);
});

req.setTimeout(10000, () => {
  console.log('⏰ Request timeout');
  req.destroy();
});
