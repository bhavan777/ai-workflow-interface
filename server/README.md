# AI Workflow Interface - Server Technical Documentation

A Node.js/TypeScript server providing AI-powered data pipeline configuration through conversational interfaces and real-time WebSocket communication.

## 🏗️ Architecture Overview

### **Core Architecture**

- **Express.js Server**: RESTful API endpoints with middleware stack
- **WebSocket Server**: Real-time bidirectional communication
- **AI Service Layer**: Groq Cloud integration for conversational AI
- **Security Middleware**: Rate limiting, CORS, origin validation
- **TypeScript**: Full type safety with strict configuration

### **Service Architecture**

- **Modular Design**: Separated concerns with clear service boundaries
- **Middleware Pattern**: Extensible middleware for cross-cutting concerns
- **Event-Driven**: WebSocket-based real-time communication
- **Stateless Design**: In-memory conversation storage with cleanup

## 🛠️ Tech Stack

### **Core Technologies**

- **Runtime**: Node.js with TypeScript compilation
- **Framework**: Express.js for REST API
- **WebSocket**: ws library for real-time communication
- **AI Integration**: Groq Cloud API for conversational processing
- **Security**: Custom middleware for rate limiting and validation

### **Development Tools**

- **TypeScript**: Strict type checking and modern JavaScript features
- **Nodemon**: Hot reloading for development
- **ESLint**: Code quality and consistency
- **Environment**: dotenv for configuration management

### **Deployment & Infrastructure**

- **Railway**: Primary deployment platform
- **Vercel**: Alternative serverless deployment
- **Environment**: Configurable for multiple deployment targets
- **Health Checks**: Built-in monitoring endpoints

## 🔧 Technical Implementation

### **Server Setup & Configuration**

#### **Express Application Structure**

```typescript
// Core server setup with middleware stack
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Security middleware (order matters)
app.use(validateOrigin);
app.use(rateLimit);
app.use(validateApiKey);

// CORS configuration with allowed origins
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
```

#### **WebSocket Integration**

- **Bidirectional Communication**: Real-time message exchange
- **Connection Management**: Automatic cleanup and error handling
- **Message Processing**: Structured message handling with TypeScript interfaces
- **Conversation State**: In-memory conversation history per connection

### **AI Service Architecture**

#### **Groq Cloud Client**

```typescript
export class GroqCloudClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1/chat/completions';

  // Automatic model fallback and retry logic
  async processMessage(
    message: string,
    conversationHistory: Message[]
  ): Promise<string>;
}
```

#### **Message Processing Pipeline**

1. **Input Validation**: TypeScript interface validation
2. **Context Building**: Conversation history integration
3. **AI Processing**: Groq Cloud API calls with fallback
4. **Response Formatting**: Structured workflow updates
5. **State Management**: Conversation and workflow state updates

### **Security Implementation**

#### **Multi-Layer Security**

- **Origin Validation**: CORS with configurable allowed origins
- **Rate Limiting**: Per-IP request limiting (100 requests/15min)
- **API Key Validation**: Extensible authentication middleware
- **Input Sanitization**: TypeScript type safety and validation

#### **Security Middleware Stack**

```typescript
// Security middleware implementation
export const validateOrigin = (req: Request, res: Response, next: NextFunction)
export const rateLimit = (req: Request, res: Response, next: NextFunction)
export const validateApiKey = (req: Request, res: Response, next: NextFunction)
```

### **Data Flow Architecture**

#### **Workflow State Management**

- **Node Structure**: Fixed 3-node workflow (Source → Transform → Destination)
- **Status Tracking**: Real-time status updates (pending, partial, complete, error)
- **Data Requirements**: Dynamic field tracking and validation
- **State Persistence**: In-memory storage with automatic cleanup

#### **Conversation Flow**

1. **Message Reception**: WebSocket message parsing and validation
2. **Context Retrieval**: Conversation history and workflow state
3. **AI Processing**: Groq Cloud integration with structured prompts
4. **Response Generation**: Workflow updates and status changes
5. **State Update**: Real-time state synchronization

## 🔌 API Reference

### **REST Endpoints**

#### **Health Check**

```http
GET /health
```

Returns server health status, uptime, and Groq API connectivity.

#### **Workflow Templates**

```http
GET /api/ai/workflows
```

Returns available workflow templates and their parameters.

#### **Conversation Management**

```http
POST /api/ai/conversations/clear
```

Manually clears all conversation history (development use).

### **WebSocket Message Types**

#### **Message Interface**

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  type: 'MESSAGE' | 'THOUGHT' | 'ERROR' | 'STATUS' | 'GET_NODE_DATA';
  content: string;
  timestamp: string;
  message_type?: 'text' | 'markdown';
  nodes?: DataFlowNode[];
  connections?: DataFlowConnection[];
  workflow_complete?: boolean;
  node_status_updates?: Array<{
    node_id: string;
    status: DataFlowNode['status'];
  }>;
}
```

#### **Supported Message Types**

- **MESSAGE**: Standard conversation messages
- **THOUGHT**: AI processing thoughts and reasoning
- **ERROR**: Error responses and handling
- **STATUS**: Processing status updates
- **GET_NODE_DATA**: Node-specific data requests

### **Workflow Data Structures**

#### **DataFlowNode Interface**

```typescript
interface DataFlowNode {
  id: string;
  type: 'source' | 'transform' | 'destination';
  name: string;
  status: 'pending' | 'partial' | 'complete' | 'error';
  config?: Record<string, any>;
  data_requirements?: {
    required_fields: string[];
    provided_fields: string[];
    missing_fields: string[];
  };
}
```

#### **DataFlowConnection Interface**

```typescript
interface DataFlowConnection {
  id: string;
  source: string;
  target: string;
  status: 'pending' | 'complete' | 'error';
}
```

## 🚀 Development Workflow

### **Environment Setup**

#### **Prerequisites**

- **Node.js**: Version 18+ required
- **TypeScript**: Global or local installation
- **Environment Variables**: GROQ_API_KEY required
- **Port Configuration**: Default 3001, configurable via PORT env var

#### **Development Commands**

```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev:watch

# Build TypeScript
npm run build

# Production start
npm start
```

### **Configuration Management**

#### **Environment Variables**

```bash
# Required
GROQ_API_KEY=gsk_your_api_key_here

# Optional
PORT=3001
NODE_ENV=development
DEPLOYMENT_TIME=2024-01-01T00:00:00Z
```

#### **CORS Configuration**

```typescript
const allowedOrigins = [
  'http://localhost:3000', // React dev server
  'http://localhost:5173', // Vite dev server
  'https://*.onrender.com', // Render deployment
  'https://*.railway.app', // Railway deployment
];
```

### **Code Quality Standards**

#### **TypeScript Configuration**

- **Strict Mode**: Enabled for maximum type safety
- **Path Mapping**: Clean import paths and module resolution
- **ESLint Integration**: TypeScript-aware linting rules
- **Type Definitions**: Comprehensive interface definitions

#### **Error Handling**

- **Global Error Middleware**: Centralized error handling
- **WebSocket Error Handling**: Connection-level error management
- **AI Service Error Handling**: Graceful fallbacks and retries
- **Type-Safe Error Responses**: Consistent error message format

#### **Performance Considerations**

- **Connection Pooling**: Efficient WebSocket connection management
- **Memory Management**: Automatic conversation cleanup
- **Rate Limiting**: Prevents abuse and ensures stability
- **Caching**: In-memory conversation state for performance

## 🔒 Security & Production

### **Security Best Practices**

#### **Input Validation**

- **TypeScript Types**: Compile-time type checking
- **Runtime Validation**: Message structure validation
- **Sanitization**: XSS prevention and input cleaning
- **Rate Limiting**: Abuse prevention and resource protection

#### **Authentication & Authorization**

- **API Key Validation**: Extensible authentication middleware
- **Origin Validation**: CORS with strict origin checking
- **IP Whitelisting**: Optional IP-based access control
- **Request Logging**: Security event monitoring

### **Production Deployment**

#### **Railway Deployment**

```bash
# Railway deployment script
./deploy-railway.sh
```

#### **Vercel Deployment**

```bash
# Vercel deployment configuration
vercel --prod
```

#### **Environment Configuration**

- **Production Variables**: Secure environment variable management
- **Health Monitoring**: Built-in health check endpoints
- **Logging**: Structured logging for monitoring and debugging
- **Error Tracking**: Comprehensive error handling and reporting

### **Monitoring & Observability**

#### **Health Checks**

- **Server Health**: Uptime, memory usage, process status
- **AI Service Health**: Groq API connectivity and response times
- **WebSocket Health**: Connection status and message processing
- **Custom Metrics**: Request rates, error rates, response times

#### **Logging Strategy**

- **Structured Logging**: JSON format for easy parsing
- **Log Levels**: Debug, info, warn, error with appropriate filtering
- **Request Tracking**: Unique request IDs for tracing
- **Performance Logging**: Response times and resource usage

## 🧪 Testing & Quality Assurance

### **Testing Strategy**

#### **Unit Testing**

- **Service Testing**: AI service and utility function testing
- **Middleware Testing**: Security and validation middleware
- **Type Testing**: TypeScript compilation as testing layer
- **Integration Testing**: End-to-end workflow testing

#### **Manual Testing**

- **WebSocket Flow**: Real-time communication testing
- **AI Integration**: Groq Cloud API integration testing
- **Error Scenarios**: Error handling and recovery testing
- **Performance Testing**: Load testing and resource monitoring

### **Code Quality**

#### **TypeScript Strictness**

- **No Implicit Any**: All types must be explicitly defined
- **Strict Null Checks**: Null and undefined handling
- **No Unused Variables**: Compile-time unused code detection
- **Exact Types**: Precise type definitions and interfaces

#### **Code Organization**

- **Modular Structure**: Clear separation of concerns
- **Service Layer**: Business logic encapsulation
- **Middleware Stack**: Extensible cross-cutting concerns
- **Type Definitions**: Centralized type management

## 🔮 Future Enhancements

### **Planned Improvements**

- **Database Integration**: Persistent conversation storage
- **Advanced AI Models**: Multi-model support and fallbacks
- **Enhanced Security**: JWT authentication and role-based access
- **Monitoring**: Advanced metrics and alerting
- **Scalability**: Horizontal scaling and load balancing

### **Architecture Evolution**

- **Microservices**: Service decomposition for scalability
- **Event Sourcing**: Event-driven architecture for state management
- **API Gateway**: Centralized API management and routing
- **Containerization**: Docker support for deployment flexibility

---

## 📋 Original Requirements Reference

_The following section contains the original rigid workflow requirements for reference._

### **Core Behavior**

#### **1. Conversation Management**

- **Stores conversations** in JSON files (development) or in-memory (production)
- **Clears conversations** on server startup for a clean slate
- **Maintains conversation history** to avoid asking the same questions twice
- **Handles conversation persistence** with automatic fallback to in-memory storage

#### **2. AI-Powered Workflow Configuration**

- **Creates rigid 3-node workflows**: Source → Transform → Destination
- **Asks predefined questions** in a fixed order for each node
- **Accepts any user input** without validation (assumes all input is correct)
- **Maintains workflow state** across conversation turns
- **Completes nodes sequentially** before moving to the next

#### **3. Rigid Question Script**

The AI follows a **fixed script** for every workflow with predefined questions for each node type.

#### **4. Node Configuration Structure**

Each node has a **fixed structure** with consistent field requirements and status tracking.

### **Key Requirements**

#### **1. Rigid Configuration**

- ✅ **Fixed node structure** - Never changes based on user input
- ✅ **Fixed question script** - Same questions for every workflow
- ✅ **Fixed field requirements** - Same fields for each node type
- ✅ **No dynamic customization** - AI doesn't adapt questions to specific services

#### **2. No Validation**

- ✅ **Accepts all input** - Never rejects or questions user input
- ✅ **No format checking** - Doesn't validate URLs, API keys, etc.
- ✅ **No real-world verification** - Doesn't check if credentials actually exist
- ✅ **Assumes correctness** - Treats all input as valid data

#### **3. Sequential Processing**

- ✅ **Source → Transform → Destination** - Always in this order
- ✅ **Complete one node at a time** - Never asks questions for multiple nodes simultaneously
- ✅ **Move to next only when complete** - All fields must be provided before progression

---

_This server provides a robust, scalable foundation for AI-powered workflow configuration with real-time communication capabilities._
