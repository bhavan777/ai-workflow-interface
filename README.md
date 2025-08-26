# AI Workflow Interface

A conversational data integration platform where users describe data pipelines and see them visualized as interactive flow diagrams. Built for the Nexla Take-Home Assignment.

## 🚀 Live Demo

- **Frontend**: [https://cute-meringue-5c8765.netlify.app](https://cute-meringue-5c8765.netlify.app)
- **Backend API**: [https://ai-workflow-interface-production.up.railway.app](https://ai-workflow-interface-production.up.railway.app)
- **WebSocket**: `wss://ai-workflow-interface-production.up.railway.app`

## 🎯 Project Overview

This project demonstrates a modern frontend application with a Node.js backend that uses AI to help users create data flows through natural language conversations. Users can describe data pipelines like "Connect Shopify to Snowflake" and the AI will guide them through the setup process with clarifying questions and visual flow diagrams.

## 🎯 Best Use Cases & Examples

### 💡 Recommended Workflow Examples

For the best experience, try these predefined examples that showcase the AI's capabilities:

1. **E-commerce Data Pipeline**
   - "Connect Shopify to Snowflake"
   - "Set up a pipeline from WooCommerce to BigQuery"
   - "Create a data flow from Magento to Redshift"

2. **Marketing Analytics**
   - "Connect HubSpot to Google Analytics"
   - "Set up a pipeline from Mailchimp to Snowflake"
   - "Create a data flow from Facebook Ads to BigQuery"

3. **CRM Integration**
   - "Connect Salesforce to Snowflake"
   - "Set up a pipeline from Pipedrive to Redshift"
   - "Create a data flow from Zoho CRM to BigQuery"

4. **Financial Data**
   - "Connect Stripe to Snowflake"
   - "Set up a pipeline from PayPal to BigQuery"
   - "Create a data flow from QuickBooks to Redshift"

### 🚀 Why These Examples Work Best

- **Clear Source & Destination**: The AI understands popular platforms and databases
- **Common Use Cases**: These are real-world scenarios the AI has been trained on
- **Structured Data**: These platforms have well-defined data schemas
- **Interactive Flow**: You'll see the AI ask clarifying questions and build visual diagrams

### 💬 Conversation Tips

- **Be Specific**: "Connect Shopify to Snowflake" works better than "set up a data pipeline"
- **Mention Platforms**: Include source and destination names for better results
- **Answer Questions**: The AI will ask for configuration details - provide them for a complete workflow
- **Follow the Flow**: Watch the visual diagram update as you provide information

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS + React Flow + Zustand
- **Backend**: Node.js + TypeScript + Express + WebSocket
- **AI**: Groq Cloud (Llama3-70B, Mixtral-8x7B, Llama3-8B) with automatic fallback
- **Real-time**: WebSocket for live chat interface
- **State Management**: Zustand for client-side state
- **UI Components**: shadcn/ui with HubSpot-inspired orange theme

## 🚀 Quick Start

### Backend Setup

1. **Navigate to server directory**:

   ```bash
   cd server
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment**:

   ```bash
   cp env.example .env
   # Edit .env and add your Groq API key (get from https://console.groq.com/)
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3001`

### Frontend Setup

1. **Navigate to client directory**:

   ```bash
   cd client
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:3000` and automatically proxy API requests to the backend.

**Features implemented:**

- React 18+ with TypeScript
- Tailwind CSS with HubSpot-inspired orange theme
- React Router for navigation
- WebSocket integration for real-time chat
- Interactive flow diagram canvas with React Flow
- Dark/light theme toggle
- Zustand for state management
- shadcn/ui components

## 📡 API Endpoints

### REST API

- `GET /health` - Health check
- `GET /api/ai/workflows` - Get workflow templates
- `POST /api/ai/conversation/start` - Start data flow conversation
- `POST /api/ai/conversation/continue` - Continue conversation

### WebSocket Events

- `MESSAGE` - User messages and AI responses
- `THOUGHT` - AI processing thoughts (server-side only)
- `STATUS` - Processing status updates
- `ERROR` - Error responses
- `GET_NODE_DATA` - Request node configuration data
- `NODE_DATA` - Node configuration data response

## 🎨 Features

### Core Requirements ✅

- [x] Backend with AI conversation capabilities (Groq Cloud)
- [x] WebSocket support for real-time communication
- [x] Structured data flow generation
- [x] REST API endpoints
- [x] Landing page with input field
- [x] Chat interface with message bubbles
- [x] Visual canvas with flow diagrams (React Flow)
- [x] Node status indicators
- [x] Properties panel for node configuration

### Bonus Features ✅

- [x] Dark/light theme toggle with persistence
- [x] Mobile-responsive design
- [x] Loading states and animations
- [x] Auto-scroll to new messages
- [x] Smooth animations with Framer Motion
- [x] Accessibility features
- [x] HubSpot-inspired orange theme
- [x] Real-time AI thoughts display
- [x] Interactive workflow canvas

## 🔧 Development

### Backend Development

```bash
cd server
npm run dev    # Start with hot reload
npm run build  # Build for production
npm start      # Run production build
```

### Testing

```bash
cd server
node test-server.js  # Test WebSocket and HTTP endpoints
```

## 📊 Data Flow Structure

The AI generates structured responses that include:

```typescript
interface DataFlowResponse {
  message: string; // Human-readable message
  nodes: DataFlowNode[]; // Flow diagram nodes
  connections: DataFlowConnection[]; // Node connections
  questions?: string[]; // Follow-up questions
  isComplete: boolean; // Flow completion status
}
```

### Node Types

- **Source** (blue): Databases, APIs, file systems
- **Transform** (purple): Data processing, filtering, mapping
- **Destination** (green): Warehouses, APIs, applications

### Node Status

- **Pending** (orange): Initial state
- **Partial** (blue): Some configuration provided
- **Complete** (green): Fully configured
- **Error** (red): Configuration issues

## 🚀 Deployment

### Backend Deployment

The server can be deployed to:

- **Railway**: Easy Node.js deployment
- **Render**: Free tier available
- **Heroku**: Traditional Node.js hosting
- **Vercel**: Serverless functions

### Environment Variables

```env
PORT=3001
NODE_ENV=production
GROQ_API_KEY=your_groq_api_key_here
```

## 📝 Assignment Requirements

This project addresses the Nexla Take-Home Assignment requirements:

- ✅ **Technical Stack**: React 18 + TypeScript + Tailwind CSS + React Flow
- ✅ **AI Integration**: Groq Cloud API for intelligent conversations
- ✅ **Real-time Communication**: WebSocket support with live updates
- ✅ **Data Flow Visualization**: Interactive React Flow canvas with node status
- ✅ **Modern Architecture**: Clean TypeScript backend with Express + WebSocket
- ✅ **State Management**: Zustand for efficient client-side state
- ✅ **UI/UX**: HubSpot-inspired design with dark/light theme support

## 🤝 Contributing

This is a take-home assignment project. The codebase is structured for easy extension and modification.

## 📄 License

This project is created for educational and assignment purposes.
