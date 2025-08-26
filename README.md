# AI Workflow Interface

A conversational data integration platform where users describe data pipelines and see them visualized as interactive flow diagrams. Built for the Nexla Take-Home Assignment.

## 🚀 Live Demo

- **Frontend**: [https://cute-meringue-5c8765.netlify.app](https://cute-meringue-5c8765.netlify.app)
- **Backend API**: [https://ai-workflow-interface-production.up.railway.app](https://ai-workflow-interface-production.up.railway.app)
- **WebSocket**: `wss://ai-workflow-interface-production.up.railway.app`

## 🎯 Project Overview

This project demonstrates a modern frontend application with a Node.js backend that uses AI to help users create data flows through natural language conversations. Users can describe data pipelines like "Connect Shopify to Snowflake" and the AI will guide them through the setup process with clarifying questions and visual flow diagrams.

## 🎯 Demo Guide - What to Expect

### 🚀 Quick Start Demo

**Step 1: Visit the App**

- Go to [https://cute-meringue-5c8765.netlify.app](https://cute-meringue-5c8765.netlify.app)
- You'll see a clean landing page with an input field

**Step 2: Start Your First Workflow**

- **Option A - Try Examples**: Click on any example card (Shopify to Snowflake, Salesforce to Mailchimp, etc.)
- **Option B - Custom Workflow**: Type your own description like `"Connect my database to Google Analytics"`
- Click "Start Workflow" or press Enter
- Watch the AI begin processing your request

**Step 3: Experience the AI Conversation**

- The AI will ask clarifying questions like:
  - "What type of Shopify data do you want to sync?"
  - "Do you have your Snowflake credentials ready?"
  - "What's your preferred sync frequency?"
- Answer these questions naturally

**Step 4: Watch the Visual Flow Build**

- As you provide information, you'll see:
  - A visual workflow diagram appear on the right
  - Nodes representing your data sources and destinations
  - Connections showing data flow between components
  - Status indicators (pending → partial → complete)

**Step 5: Complete the Configuration**

- The AI will guide you through each step
- You'll see real-time updates to the workflow
- The diagram will show completion status for each component

### 💡 Best Demo Examples

Try these specific examples for the most impressive demo:

1. **Shopify to Snowflake** (Click the example card)
   - Shows e-commerce data pipeline
   - AI asks about product data, orders, customers
   - Visual flow builds as you answer

2. **Salesforce to Mailchimp** (Click the example card)
   - Demonstrates CRM to email marketing integration
   - AI guides through contact data and sync settings
   - Shows lead nurturing workflows

3. **HubSpot to Analytics** (Click the example card)
   - Marketing analytics integration
   - AI handles lead tracking and conversion data
   - Professional marketing workflow

4. **Stripe to BigQuery** (Click the example card)
   - Payment data to data warehouse
   - AI guides through transaction data and reporting
   - Financial analytics workflow

### 🎨 What You'll See

**Real-time AI Processing:**

- Live typing indicators
- AI "thinking" messages
- Progressive workflow building

**Interactive Visual Elements:**

- Drag-and-drop ready workflow canvas
- Color-coded nodes (blue=source, purple=transform, green=destination)
- Status indicators with animations
- Clickable nodes for detailed configuration

**Professional UI:**

- HubSpot-inspired orange theme
- Dark/light mode toggle
- Responsive design (works on mobile)
- Smooth animations and transitions

### 💬 Pro Tips for Demo

- **Try the Examples**: Click on example cards for instant, predictable workflows
- **Be Specific**: "Connect Shopify to Snowflake" works better than "set up a data pipeline"
- **Answer Questions**: The AI will ask for details - provide them for a complete workflow
- **Watch the Flow**: The visual diagram updates in real-time as you interact
- **Try Different Scenarios**: Each example shows different AI capabilities
- **Explore the Interface**: Click on nodes to see detailed configuration panels

### 🔧 Implementation Approach

**Current Demo Implementation:**

- **Client-side Template Conversion**: URL parameters like `/workflow/shopify-snowflake` are converted to natural language messages
- **No Server Changes**: Uses existing AI conversation flow without backend modifications
- **Quick Prototype**: Implemented for demo purposes to save development time

**Ideal Production Approach:**

- **Server-side Templates**: Pre-built workflow templates stored on the server
- **Template IDs**: `/workflow/shopify-snowflake` would load a predefined template
- **Reduced AI Costs**: Examples wouldn't consume AI tokens
- **Consistent Experience**: Same workflow structure every time
- **Better Performance**: Instant template loading vs AI processing
- **Professional UX**: Like real SaaS products with predefined integrations

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
