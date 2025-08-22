import { Request, Response, NextFunction } from 'express';

// Allowed origins for API access
const ALLOWED_ORIGINS = [
  'http://localhost:3000',  // React dev server
  'http://localhost:3001',  // Your server
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  // Add your production domain when deployed
  // 'https://yourdomain.com'
];

// Allowed IP addresses (optional)
const ALLOWED_IPS = [
  '127.0.0.1',
  '::1', // IPv6 localhost
  // Add your server IP when deployed
];

export const validateOrigin = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('Origin');
  const clientIP = req.ip || req.connection.remoteAddress;

  // Allow requests with no origin (like file:// protocol or curl requests)
  if (!origin) {
    return next();
  }

  // Check if origin is allowed
  if (!ALLOWED_ORIGINS.includes(origin)) {
    console.warn(`Blocked request from unauthorized origin: ${origin}`);
    return res.status(403).json({ 
      error: 'Access denied: Unauthorized origin',
      allowedOrigins: ALLOWED_ORIGINS 
    });
  }

  // Check if IP is allowed (optional, for extra security)
  if (clientIP && !ALLOWED_IPS.includes(clientIP)) {
    console.warn(`Blocked request from unauthorized IP: ${clientIP}`);
    return res.status(403).json({ 
      error: 'Access denied: Unauthorized IP address',
      allowedIPs: ALLOWED_IPS 
    });
  }

  next();
};

// Rate limiting middleware
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Max requests per window

  if (!clientIP) {
    return res.status(400).json({ error: 'Unable to identify client' });
  }

  const clientData = requestCounts.get(clientIP);
  
  if (!clientData || now > clientData.resetTime) {
    // First request or window expired
    requestCounts.set(clientIP, { count: 1, resetTime: now + windowMs });
  } else if (clientData.count >= maxRequests) {
    // Rate limit exceeded
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  } else {
    // Increment count
    clientData.count++;
  }

  next();
};

// API key validation middleware (for additional security)
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
  
  // You can add your own API key validation here
  // For now, we'll just log the request
  console.log(`API request from ${req.ip} to ${req.path}`);
  
  next();
};
