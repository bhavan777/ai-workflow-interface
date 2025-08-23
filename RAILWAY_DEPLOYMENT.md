# Railway Deployment Guide

## Quick Setup (2 minutes)

### 1. Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository: `bhavan777/ai-workflow-interface`
5. **Important**: Select the `railway-deploy` branch (not main)

### 2. Configure Environment Variables
In Railway dashboard → Variables tab, add:
```
GROQ_API_KEY=your_groq_api_key_here
NODE_ENV=production
PORT=3001
```

### 3. Deploy
- Railway will automatically build and deploy
- Your server will be available at: `https://your-project-name.railway.app`

## Features
✅ **WebSocket Support**: Native WebSocket connections  
✅ **Health Checks**: Automatic health monitoring  
✅ **Auto-restart**: Server restarts on failure  
✅ **Free Tier**: 500 hours/month (enough for demo)  

## Testing
```bash
# Health check
curl https://your-project-name.railway.app/health

# WebSocket test (update URL in test-websocket.js)
node server/test-websocket.js
```

## Cost
- **Free**: 500 hours/month (20+ days)
- **Paid**: $5/month if you exceed free tier
- **Cancel anytime**: No commitment

## Next Steps
1. Deploy to Railway using `railway-deploy` branch
2. Set environment variables
3. Test the endpoints
4. Update client WebSocket URL to your Railway domain
5. Demo ready! 🎉
