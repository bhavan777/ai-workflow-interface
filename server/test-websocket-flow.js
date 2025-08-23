const WebSocket = require('ws');

// Test the WebSocket conversation flow
async function testWebSocketFlow() {
  console.log('🧪 Starting WebSocket conversation flow test...\n');

  const ws = new WebSocket('ws://localhost:3001');

  ws.on('open', () => {
    console.log('✅ Connected to WebSocket server');

    // Start the conversation
    const startMessage = {
      id: 'test-msg-1',
      role: 'user',
      type: 'MESSAGE',
      content: 'I want to connect Shopify to Snowflake',
      timestamp: new Date().toISOString(),
    };

    console.log('\n📤 Sending initial message:', startMessage.content);
    ws.send(JSON.stringify(startMessage));
  });

  let messageCount = 0;
  const maxMessages = 20; // Increased limit
  let lastAssistantMessage = null;

  ws.on('message', data => {
    messageCount++;
    if (messageCount > maxMessages) {
      console.log('\n⚠️ Reached max message limit, closing connection');
      ws.close();
      return;
    }

    try {
      const message = JSON.parse(data.toString());
      console.log(`\n📥 Received message #${messageCount}:`);
      console.log(`   Type: ${message.type}`);
      console.log(`   Role: ${message.role}`);
      console.log(`   Content: ${message.content}`);

      if (message.nodes) {
        console.log(`   Nodes: ${message.nodes.length} nodes`);
        message.nodes.forEach(node => {
          console.log(`     - ${node.name} (${node.type}): ${node.status}`);
          if (node.config && Object.keys(node.config).length > 0) {
            console.log(`       Config: ${JSON.stringify(node.config)}`);
          }
        });
      }

      if (message.connections) {
        console.log(
          `   Connections: ${message.connections.length} connections`
        );
      }

      // Store the last assistant message for response logic
      if (message.type === 'MESSAGE' && message.role === 'assistant') {
        lastAssistantMessage = message;
      }

      // Simulate user responses based on the conversation flow
      if (message.type === 'MESSAGE' && message.role === 'assistant') {
        setTimeout(() => {
          let response;

          if (message.content.includes('Shopify store URL')) {
            response = {
              id: `test-msg-${messageCount + 1}`,
              role: 'user',
              type: 'MESSAGE',
              content: 'mystore.myshopify.com',
              timestamp: new Date().toISOString(),
            };
            console.log('\n📤 Sending response: Shopify store URL');
          } else if (message.content.includes('Shopify API key')) {
            response = {
              id: `test-msg-${messageCount + 1}`,
              role: 'user',
              type: 'MESSAGE',
              content: 'abc123',
              timestamp: new Date().toISOString(),
            };
            console.log('\n📤 Sending response: Shopify API key');
          } else if (
            message.content.includes('data processing') ||
            message.content.includes('transformation')
          ) {
            response = {
              id: `test-msg-${messageCount + 1}`,
              role: 'user',
              type: 'MESSAGE',
              content: 'Clean and validate the data',
              timestamp: new Date().toISOString(),
            };
            console.log('\n📤 Sending response: Data processing type');
          } else if (
            message.content.includes('Snowflake') ||
            message.content.includes('destination')
          ) {
            response = {
              id: `test-msg-${messageCount + 1}`,
              role: 'user',
              type: 'MESSAGE',
              content: 'xyz123.snowflakecomputing.com',
              timestamp: new Date().toISOString(),
            };
            console.log('\n📤 Sending response: Snowflake account URL');
          } else if (
            message.content.includes('complete') ||
            message.content.includes('ready')
          ) {
            console.log('\n🎉 Conversation appears to be complete!');
            ws.close();
            return;
          } else {
            // Generic response for unexpected questions
            response = {
              id: `test-msg-${messageCount + 1}`,
              role: 'user',
              type: 'MESSAGE',
              content: 'test-value',
              timestamp: new Date().toISOString(),
            };
            console.log('\n📤 Sending generic response');
          }

          if (response) {
            ws.send(JSON.stringify(response));
          }
        }, 2000); // Wait 2 seconds before responding
      }
    } catch (error) {
      console.error('❌ Error parsing message:', error);
    }
  });

  ws.on('error', error => {
    console.error('❌ WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('\n🔌 WebSocket connection closed');
    console.log('✅ Test completed');
  });
}

// Run the test
testWebSocketFlow().catch(console.error);
