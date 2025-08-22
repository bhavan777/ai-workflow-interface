const WebSocket = require('ws');

// Test WebSocket connection
function testWebSocket() {
  const ws = new WebSocket('ws://localhost:3001');
  
  ws.on('open', () => {
    console.log('✅ WebSocket connected successfully');
    
    // Test conversation start
    ws.send(JSON.stringify({
      type: 'conversation_start',
      id: 'test-1',
      data: {
        description: 'Connect Shopify to Snowflake'
      }
    }));
  });
  
  ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('📨 Received message:', message.type);
    
    if (message.type === 'error') {
      console.log('❌ Error:', message.error);
    } else if (message.type === 'conversation_start') {
      console.log('✅ Conversation started successfully');
      console.log('📊 Flow data:', message.data);
    }
    
    ws.close();
  });
  
  ws.on('error', (error) => {
    console.log('❌ WebSocket error:', error.message);
  });
}

// Test HTTP endpoints
async function testHTTP() {
  try {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    console.log('✅ Health check:', data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  try {
    const response = await fetch('http://localhost:3001/api/ai/conversation/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'Connect Shopify to Snowflake'
      })
    });
    const data = await response.json();
    console.log('✅ Conversation start endpoint:', data);
  } catch (error) {
    console.log('❌ Conversation start endpoint failed:', error.message);
  }
}

// Run tests
console.log('🧪 Testing server...');
testHTTP();
setTimeout(testWebSocket, 1000); // Wait a bit for HTTP test to complete
