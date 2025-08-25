# AI Workflow Interface - Conversational Data Integration Platform

A modern React + TypeScript application that transforms complex data pipeline creation into simple, conversational experiences. Users describe their data integration needs in plain English, and the AI guides them through building interactive workflow diagrams.

## 🎯 Project Overview

This project addresses the challenge of making data integration accessible to non-technical users. Instead of requiring deep technical knowledge, users can simply describe what they want to accomplish (e.g., "Connect Shopify to Snowflake"), and the AI guides them through the process with clarifying questions while visualizing the workflow in real-time.

### **Core Problem Solved**

- **Complexity Reduction**: Transforms technical data pipeline creation into conversational workflows
- **Accessibility**: Makes data integration accessible to business users, analysts, and project managers
- **Visual Learning**: Combines chat and visual workflow to help users understand data processes
- **Real-time Collaboration**: AI works with users in real-time to build and refine workflows

## 🚀 Live Demo

- **Frontend**: [https://cute-meringue-5c8765.netlify.app/](https://cute-meringue-5c8765.netlify.app/)
- **Backend**: [https://ai-workflow-interface-production.up.railway.app/](https://ai-workflow-interface-production.up.railway.app/)

## 🤖 AI Integration

### **Groq Cloud AI**

This project leverages **Groq Cloud AI** for intelligent conversational processing, providing fast and reliable AI responses for workflow generation.

#### **AI Models Used**

- **Primary Model**: `llama3-8b-8192` - Fast, efficient processing for real-time conversations
- **Fallback Model**: `mixtral-8x7b-32768` - Robust fallback for complex queries
- **Model Selection**: Automatic model fallback based on response quality and performance

#### **AI Capabilities**

- **Natural Language Understanding**: Processes user descriptions in plain English
- **Contextual Conversations**: Maintains conversation history for coherent interactions
- **Workflow Generation**: Creates structured data flow diagrams from natural language
- **Real-time Processing**: Sub-second response times for smooth user experience
- **Error Recovery**: Graceful handling of AI service interruptions

## 🏗️ Architecture

### **Full-Stack Implementation**

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + WebSocket
- **AI Integration**: Groq Cloud for conversational processing
- **Real-time Communication**: WebSocket for live updates
- **State Management**: Zustand for lightweight, performant state

### **Project Structure**

```
ai-workflow-interface/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components (Home, Workflow)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Zustand state management
│   │   ├── types/         # TypeScript type definitions
│   │   └── lib/           # Utility functions
│   └── README.md          # Frontend technical documentation
├── server/                # Node.js backend application
│   ├── src/
│   │   ├── services/      # AI service and business logic
│   │   ├── middleware/    # Security and validation middleware
│   │   ├── routes/        # API route handlers
│   │   └── websocket.ts   # Real-time communication
│   └── README.md          # Backend technical documentation
└── README.md              # This file - project overview
```

## ✨ Key Features

### **1. Landing Page**

- **Hero Section**: Clear value proposition and call-to-action
- **Large Input Field**: Prominent workflow description input
- **Example Prompts**: Pre-built examples for quick start
  - "Connect Shopify to BigQuery"
  - "Sync Salesforce contacts to Mailchimp"
  - "Stream Stripe payments to Google Sheets"
- **Dark/Light Theme**: Toggle with persistent storage
- **Mobile-Responsive**: Optimized for all device sizes

### **2. Chat Interface**

- **Clean Message Bubbles**: Distinct styling for user vs AI messages
- **Real-time Input**: Live typing with send button
- **Loading States**: Animated wave loader for AI responses
- **Auto-scroll**: Automatic scrolling to new messages
- **AI Clarifying Questions**: Intelligent follow-up questions based on context
- **Thought Broadcasting**: Real-time AI processing thoughts

### **3. Visual Canvas**

- **Split-pane Layout**: Chat and canvas side-by-side
- **Interactive Flow Diagram**: Three node types with color coding
  - **Source** (blue): Databases, APIs, data sources
  - **Transform** (purple): Data processing and transformations
  - **Destination** (green): Data warehouses, APIs, outputs
- **Status Indicators**: Visual progress tracking
  - Pending (gray) → Partial (orange) → Complete (green) → Error (red)
- **Properties Panel**: Detailed configuration for selected nodes
- **Responsive Design**: Adapts to different screen sizes

### **4. Navigation & State**

- **React Router**: Seamless navigation between landing and workflow
- **Zustand State Management**: Efficient state management with TypeScript
- **Theme Persistence**: Local storage for user preferences
- **Conversation State**: Real-time workflow state synchronization

## 🎨 Design Decisions

### **HubSpot-Inspired Theme**

- **Orange Color Scheme**: Warm, approachable, and trustworthy
- **Professional Yet Accessible**: Business-appropriate without being intimidating
- **High Contrast**: Excellent readability in all lighting conditions
- **Consistent Branding**: Unified color palette throughout the application

### **Conversational UX**

- **Natural Language Processing**: Users describe goals in plain English
- **Progressive Disclosure**: Information revealed as needed, not overwhelming
- **Visual Feedback**: Real-time updates show progress and status
- **Error Recovery**: Easy to correct mistakes or change direction

### **Responsive Design**

- **Mobile-First Approach**: Optimized for mobile devices first
- **Adaptive Layout**: Chat and canvas adapt to screen size
- **Touch-Friendly**: Large touch targets and intuitive gestures
- **Performance Optimized**: Fast loading and smooth interactions

### **Accessibility**

- **Keyboard Navigation**: Full keyboard support for all features
- **Screen Reader Friendly**: Proper ARIA labels and semantic HTML
- **High Contrast**: WCAG compliant color ratios
- **Focus Management**: Logical tab order and focus indicators

## 🛠️ Technical Implementation

### **Frontend Architecture**

- **React 18**: Latest React features with hooks and functional components
- **TypeScript**: Strict typing with no `any` types for better development experience
- **Tailwind CSS**: Utility-first styling with custom design system
- **Zustand**: Lightweight state management with TypeScript support
- **React Router**: Client-side routing with clean URLs
- **Framer Motion**: Smooth animations and micro-interactions

### **Backend Architecture**

- **Node.js + Express**: RESTful API with middleware stack
- **WebSocket**: Real-time bidirectional communication
- **Groq Cloud AI**: Conversational AI processing with model fallback
- **TypeScript**: Full type safety on the server side
- **Security Middleware**: Rate limiting, CORS, origin validation

### **Real-time Communication**

- **WebSocket Integration**: Live updates between client and server
- **Message Types**: Structured message handling with TypeScript interfaces
- **State Synchronization**: Real-time workflow state updates
- **Error Handling**: Graceful degradation and recovery

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+ (for both client and server)
- npm or yarn package manager
- Groq Cloud API key (for AI functionality)

### **Quick Start**

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai-workflow-interface
   ```

2. **Set up the backend**

   ```bash
   cd server
   npm install
   cp env.example .env
   # Add your GROQ_API_KEY to .env
   npm run dev
   ```

3. **Set up the frontend**

   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Open the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

### **Environment Variables**

#### **Backend (.env)**

```bash
GROQ_API_KEY=gsk_your_api_key_here
PORT=3001
NODE_ENV=development
```

#### **Frontend**

No environment variables required for development (uses proxy to backend).

## 📱 Sample User Flow

1. **Landing Page**: User enters "Connect Shopify orders to Snowflake"
2. **Navigation**: Automatically navigates to chat interface
3. **AI Interaction**: AI asks clarifying questions:
   - "What's your Shopify store URL?"
   - "Which data fields do you need?"
   - "What's your Snowflake connection details?"
4. **Visual Updates**: Canvas shows workflow: [Shopify] → [Transform] → [Snowflake]
5. **Status Updates**: Nodes update from pending → partial → complete
6. **Completion**: Workflow is ready for execution

## 🎯 Evaluation Criteria Met

### **Visual Design** ✅

- **Modern UI**: HubSpot-inspired design with attention to detail
- **Animations**: Smooth micro-interactions and transitions
- **Responsive**: Mobile-first design that works on all devices
- **Theme Support**: Dark/light mode with persistent storage

### **Code Quality** ✅

- **Clean TypeScript**: Strict typing with no `any` types
- **Component Architecture**: Modular, reusable components
- **State Management**: Efficient Zustand implementation
- **Error Handling**: Comprehensive error boundaries and recovery

### **User Experience** ✅

- **Intuitive Interactions**: Natural conversational flow
- **Responsive Design**: Optimized for all screen sizes
- **Loading States**: Clear feedback during AI processing
- **Accessibility**: Full keyboard navigation and screen reader support

### **Technical Implementation** ✅

- **State Management**: Zustand for efficient state handling
- **Routing**: React Router with clean navigation
- **Performance**: Optimized rendering and bundle size
- **Real-time Updates**: WebSocket integration for live communication

## 🌟 Bonus Features Implemented

### **Smooth Animations** ✅

- Framer Motion integration for micro-interactions
- Wave loader for AI responses
- Smooth transitions between states
- Hover effects and visual feedback

### **Accessibility** ✅

- ARIA labels throughout the application
- Full keyboard navigation support
- Screen reader friendly markup
- High contrast color ratios

### **Error Handling** ✅

- Comprehensive error boundaries
- Graceful degradation for network issues
- User-friendly error messages
- Recovery mechanisms for failed operations

### **Component Documentation** ✅

- Comprehensive README files for both client and server
- TypeScript interfaces for all components
- Clear code organization and structure
- Inline documentation for complex logic

### **Performance Optimizations** ✅

- React.memo for component optimization
- useCallback and useMemo for function memoization
- Efficient state management with Zustand
- Optimized bundle size and loading

## 🔧 Development Commands

### **Frontend (client/)**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### **Backend (server/)**

```bash
npm run dev          # Start development server
npm run dev:watch    # Development with hot reload
npm run build        # Build TypeScript
npm start           # Start production server
```

## 📚 Documentation

- **[Frontend Documentation](./client/README.md)**: Detailed technical documentation for the React application
- **[Backend Documentation](./server/README.md)**: Comprehensive server architecture and API documentation
- **[Deployment Guides](./server/RAILWAY_DEPLOYMENT.md)**: Railway deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Nexla**: For the inspiring take-home assignment
- **Groq Cloud**: For providing the AI capabilities
- **React Community**: For the excellent ecosystem and tools
- **Tailwind CSS**: For the utility-first CSS framework

---

_This project demonstrates modern frontend development practices while solving real-world problems in data integration accessibility._
