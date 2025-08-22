import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleWebSocketConnection } from './websocket';
import { aiRoutes } from './routes/ai';
import { validateOrigin, rateLimit, validateApiKey } from './middleware/security';
import { clearAllConversations } from './services/aiService';

dotenv.config();

// Disable SSL certificate verification for development
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(validateOrigin);
app.use(rateLimit);
app.use(validateApiKey);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://ai-workflow-server.onrender.com',
      'https://*.onrender.com',
      'http://localhost:5173', // Vite dev server
      'http://localhost:4173'  // Vite preview
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Global error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Routes
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket connection handling
wss.on('connection', handleWebSocketConnection);

// WebSocket error handling
wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  // Close WebSocket server
  wss.close(() => {
    console.log('📡 WebSocket server closed');
  });
  
  // Close HTTP server
  server.close(() => {
    console.log('🌐 HTTP server closed');
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Handle SIGTERM (Docker, Kubernetes)
process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM');
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  gracefulShutdown('SIGINT');
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  
  // Only clear conversations if this is a fresh start (not a crash restart)
  const isCrashRestart = process.argv.includes('--crash-restart');
  const isFreshStart = process.argv.includes('--fresh-start');
  
  if (isFreshStart) {
    console.log('🧹 Fresh start detected - clearing all conversations');
    clearAllConversations();
  } else if (isCrashRestart) {
    console.log('🔄 Crash restart detected - preserving conversations');
  } else {
    console.log('🚀 Normal start - clearing conversations for clean slate');
    clearAllConversations();
  }
});
