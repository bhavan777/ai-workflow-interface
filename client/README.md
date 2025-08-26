# AI Workflow Interface - Client

A modern React + TypeScript + Tailwind CSS frontend for the AI Workflow Interface, featuring a HubSpot-inspired orange theme with dark/light mode support.

## 🚀 Live Demo

**Frontend**: [https://cute-meringue-5c8765.netlify.app](https://cute-meringue-5c8765.netlify.app)

## 🎯 What You'll Experience

### 🎨 Visual Interface

- **HubSpot-Inspired Orange Theme**: Professional, modern design with orange accents
- **Dark/Light Mode Toggle**: Switch themes with persistent storage
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions

### ⚡ Real-time Features

- **Live AI Conversations**: Watch the AI respond in real-time
- **Interactive Workflow Canvas**: Visual data flow diagrams with React Flow
- **Status Indicators**: Color-coded node status (pending → partial → complete)
- **Real-time Updates**: Workflow builds as you provide information

### 🔄 Interactive Elements

- **Clickable Nodes**: Click any node to see detailed configuration
- **Drag-and-Drop Ready**: Canvas supports drag-and-drop interactions
- **Visual Feedback**: Hover effects and loading states
- **Progress Tracking**: See your workflow completion status

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with CSS variables
- **shadcn/ui** - Component library
- **Vite** - Build tool and dev server
- **Lucide React** - Icons
- **clsx + tailwind-merge** - Utility functions

## 🎨 Theme

### HubSpot-Inspired Orange Theme

- **Primary Color**: Orange (`hsl(24 95% 53%)`)
- **Gradients**: Orange to orange-600
- **Dark Mode**: Full support with proper contrast
- **CSS Variables**: Dynamic theming system

### Color Palette

- **Primary**: HubSpot Orange
- **Secondary**: Gray scale
- **Status Colors**: Green (success), Yellow (warning), Red (error)
- **Background**: Light gray to dark gray (dark mode)

## 📦 Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Start development server:**

```bash
npm run dev
```

3. **Build for production:**

```bash
npm run build
```

4. **Preview production build:**

```bash
npm run preview
```

## 🔧 Development

### Prerequisites

- Node.js 18+
- Backend server running on port 3001

### Development Workflow

1. Start the backend server: `cd ../server && npm run dev`
2. Start the frontend: `npm run dev`
3. Open http://localhost:3000

### API Proxy

The development server automatically proxies `/api/*` requests to `http://localhost:3001`, so you can use relative URLs in your API calls.

## 📁 Project Structure

```
client/
├── src/
│   ├── components/
│   │   └── ui/           # shadcn/ui components
│   │       ├── button.tsx
│   │       └── input.tsx
│   ├── lib/
│   │   └── utils.ts      # Utility functions
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles and Tailwind
├── public/               # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── components.json       # shadcn/ui configuration
```

## 🎨 Design System

### Components

- **Button**: Primary, secondary, ghost, and outline variants
- **Input**: Consistent styling with focus states
- **Card**: Clean containers with subtle shadows
- **Status Badges**: Color-coded for different states

### Icons

Using Lucide React icons:

- **Brain**: AI/Intelligence
- **Database**: Data sources
- **Zap**: Transformations
- **ArrowRight**: Connections
- **MessageSquare**: Communication
- **Settings**: Configuration
- **Sun/Moon**: Theme toggle

## 🔌 Real-time Communication

The client communicates with the backend through WebSocket for real-time interactions:

### WebSocket Connection

- **Automatic Connection**: Connects to backend WebSocket on app load
- **Real-time Messages**: Instant message delivery and responses
- **Connection Management**: Automatic reconnection on disconnection
- **Error Handling**: Graceful error handling with user feedback

### Message Types

- **MESSAGE**: User messages and AI responses
- **STATUS**: Processing status updates
- **ERROR**: Error responses
- **GET_NODE_DATA**: Request node configuration data
- **NODE_DATA**: Node configuration data response

### State Management

- **Zustand Store**: Efficient client-side state management
- **Real-time Updates**: UI updates instantly as data changes
- **Persistent State**: Maintains conversation state across sessions

## 🚀 Deployment

### Build

```bash
npm run build
```

### Deploy

The built files in `dist/` can be deployed to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Render (static site)

## 🌙 Dark Mode

The application supports both light and dark modes:

- **Toggle**: Click the sun/moon icon in the header
- **Persistence**: Theme preference is saved in localStorage
- **System Preference**: Automatically detects system theme on first visit

## 📝 License

ISC License
