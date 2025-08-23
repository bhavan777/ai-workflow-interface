const WebSocket = require('ws');

// Update this URL to your Railway deployment URL
const ws = new WebSocket('wss://your-project-name.railway.app');

ws.on('open', function open() {
  console.log('✅ WebSocket connection opened');

  // Send a test message
  const testMessage = {
    type: 'conversation_start',
    id: 'test-' + Date.now(),
    data: {
      description: 'Create a simple workflow for processing user data',
    },
  };

  console.log('📤 Sending test message:', JSON.stringify(testMessage, null, 2));
  ws.send(JSON.stringify(testMessage));
});

ws.on('message', function message(data) {
  console.log('📥 Received message:', data.toString());
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err.message);
});

ws.on('close', function close() {
  console.log('🔌 WebSocket connection closed');
});

// Close after 10 seconds
setTimeout(() => {
  console.log('⏰ Closing connection after timeout');
  ws.close();
}, 10000);
