const WebSocket = require('ws');

const WS_URL =
  'wss://nexla-gxtvjph0e-bhavan777s-projects.vercel.app/api/websocket';

console.log('🧪 Testing deployed Vercel serverless functions...');
console.log(`🔗 WebSocket URL: ${WS_URL}`);

// Test WebSocket connection
function testWebSocketConnection() {
  return new Promise((resolve, reject) => {
    console.log('🔌 Attempting WebSocket connection...');

    const ws = new WebSocket(WS_URL);

    ws.on('open', () => {
      console.log('✅ WebSocket connection established!');

      // Test conversation_start message
      const testMessage = {
        type: 'conversation_start',
        id: `test-${Date.now()}`,
        data: {
          description:
            'Test workflow: Connect my test database to a data warehouse',
        },
      };

      console.log(
        '📤 Sending test message:',
        JSON.stringify(testMessage, null, 2)
      );
      ws.send(JSON.stringify(testMessage));
    });

    ws.on('message', data => {
      try {
        const message = JSON.parse(data.toString());
        console.log('📨 Received message:', JSON.stringify(message, null, 2));

        if (message.type === 'error') {
          console.log('❌ Server returned error:', message.error);
          ws.close();
          reject(new Error(message.error));
        } else if (
          message.type === 'conversation_start' ||
          message.type === 'conversation_continue'
        ) {
          console.log('✅ Server responded successfully!');
          ws.close();
          resolve(message);
        } else if (message.type === 'thought') {
          console.log('💭 Server thought:', message.data?.message);
        }
      } catch (error) {
        console.error('❌ Error parsing message:', error);
        ws.close();
        reject(error);
      }
    });

    ws.on('error', error => {
      console.error('❌ WebSocket error:', error.message);
      reject(error);
    });

    ws.on('close', (code, reason) => {
      console.log(`🔌 WebSocket closed: ${code} - ${reason}`);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      console.log('⏰ Test timeout - closing connection');
      ws.close();
      reject(new Error('Test timeout'));
    }, 30000);
  });
}

// Test HTTP endpoint
async function testHttpEndpoint() {
  const HTTP_URL =
    'https://nexla-gxtvjph0e-bhavan777s-projects.vercel.app/api/websocket';

  console.log('\n🌐 Testing HTTP endpoint...');
  console.log(`🔗 HTTP URL: ${HTTP_URL}`);

  try {
    const response = await fetch(HTTP_URL, {
      method: 'GET',
      headers: {
        Upgrade: 'websocket',
        Connection: 'Upgrade',
      },
    });

    console.log(`📊 HTTP Status: ${response.status}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));

    if (response.status === 101) {
      console.log('✅ HTTP endpoint supports WebSocket upgrade!');
    } else {
      console.log(
        '⚠️ HTTP endpoint response:',
        response.status,
        response.statusText
      );
    }
  } catch (error) {
    console.error('❌ HTTP test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  try {
    await testHttpEndpoint();
    await testWebSocketConnection();
    console.log('\n🎉 All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
