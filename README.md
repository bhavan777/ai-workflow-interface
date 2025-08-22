# AI Workflow Interface

A conversational data integration platform where users describe data pipelines and see them visualized as interactive flow diagrams. Built for the Nexla Take-Home Assignment.

## 🎯 Project Overview

This project demonstrates a modern frontend application with a Node.js backend that uses AI to help users create data flows through natural language conversations. Users can describe data pipelines like "Connect Shopify to Snowflake" and the AI will guide them through the setup process with clarifying questions and visual flow diagrams.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS (to be implemented)
- **Backend**: Node.js + TypeScript + Express + WebSocket
- **AI**: OpenAI GPT-3.5-turbo for intelligent conversations
- **Real-time**: WebSocket for live chat interface

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
   # Edit .env and add your OpenAI API key
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3001`

### Frontend Setup (Coming Soon)

The frontend will be implemented in the `client/` directory with:
- React 18+ with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- WebSocket integration for real-time chat
- Interactive flow diagram canvas

## 📡 API Endpoints

### REST API
- `GET /health` - Health check
- `GET /api/ai/workflows` - Get workflow templates
- `POST /api/ai/conversation/start` - Start data flow conversation
- `POST /api/ai/conversation/continue` - Continue conversation

### WebSocket Events
- `conversation_start` - Start new conversation
- `conversation_continue` - Continue existing conversation
- `status` - Processing status updates
- `error` - Error responses

## 🎨 Features

### Core Requirements ✅
- [x] Backend with AI conversation capabilities
- [x] WebSocket support for real-time communication
- [x] Structured data flow generation
- [x] REST API endpoints
- [ ] Landing page with input field
- [ ] Chat interface with message bubbles
- [ ] Visual canvas with flow diagrams
- [ ] Node status indicators
- [ ] Properties panel

### Bonus Features 🎯
- [ ] Dark/light theme toggle
- [ ] Mobile-responsive design
- [ ] Loading states
- [ ] Auto-scroll to new messages
- [ ] Smooth animations
- [ ] Accessibility features

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
  message: string;           // Human-readable message
  nodes: DataFlowNode[];     // Flow diagram nodes
  connections: DataFlowConnection[]; // Node connections
  questions?: string[];      // Follow-up questions
  isComplete: boolean;       // Flow completion status
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
OPENAI_API_KEY=your_openai_api_key
```

## 📝 Assignment Requirements

This project addresses the Nexla Take-Home Assignment requirements:

- ✅ **Technical Stack**: React + TypeScript + Tailwind CSS (frontend pending)
- ✅ **AI Integration**: OpenAI API for intelligent conversations
- ✅ **Real-time Communication**: WebSocket support
- ✅ **Data Flow Visualization**: Structured node/connection system
- ✅ **Modern Architecture**: Clean TypeScript backend

## 🤝 Contributing

This is a take-home assignment project. The codebase is structured for easy extension and modification.

## 📄 License

This project is created for educational and assignment purposes.
