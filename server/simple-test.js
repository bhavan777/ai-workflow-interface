const WebSocket = require('ws');

console.log('🧪 Starting simple WebSocket test...\n');

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
  console.log('✅ Connected to WebSocket server');
  
  // Send initial message
  const message = {
    id: 'test-1',
    role: 'user',
    type: 'MESSAGE',
    content: 'I want to connect Shopify to Snowflake',
    timestamp: new Date().toISOString()
  };

  console.log('📤 Sending:', message.content);
  ws.send(JSON.stringify(message));
});

let messageCount = 0;

ws.on('message', (data) => {
  messageCount++;
  const message = JSON.parse(data.toString());
  
  console.log(`\n📥 Message #${messageCount}:`);
  console.log(`   Type: ${message.type}`);
  console.log(`   Content: ${message.content}`);
  
  if (message.nodes) {
    console.log(`   Nodes: ${message.nodes.length}`);
    message.nodes.forEach(node => {
      console.log(`     - ${node.name}: ${node.status}`);
    });
  }
  
  // Send a response after the first assistant message
  if (message.type === 'MESSAGE' && message.role === 'assistant' && messageCount === 6) {
    setTimeout(() => {
      const response = {
        id: 'test-2',
        role: 'user',
        type: 'MESSAGE',
        content: 'mystore.myshopify.com',
        timestamp: new Date().toISOString()
      };
      
      console.log('\n📤 Sending response: mystore.myshopify.com');
      ws.send(JSON.stringify(response));
    }, 1000);
  }
  
  // Close after a few messages
  if (messageCount > 15) {
    console.log('\n✅ Test completed');
    ws.close();
  }
});

ws.on('error', (error) => {
  console.error('❌ Error:', error);
});

ws.on('close', () => {
  console.log('🔌 Connection closed');
});
