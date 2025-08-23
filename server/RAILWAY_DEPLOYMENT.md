# Railway Deployment Guide

## Quick Setup (2 minutes)

### 1. Create Railway Account

- Go to [railway.app](https://railway.app)
- Sign up with GitHub
- No credit card required for free tier

### 2. Deploy from GitHub

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `ai-workflow-interface` repository
4. Railway will use the `railway.json` configuration to build the server

### 3. Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```
GROQ_API_KEY=your_groq_api_key_here
NODE_ENV=production
PORT=3001
```

### 4. Deploy

- Railway will automatically build and deploy
- Your server will be available at: `https://your-project-name.railway.app`

## Features

✅ **WebSocket Support**: Native WebSocket connections  
✅ **Health Checks**: Automatic health monitoring  
✅ **Auto-restart**: Server restarts on failure  
✅ **Logging**: Built-in logging and monitoring  
✅ **Free Tier**: 500 hours/month (enough for demo)  
✅ **No Downtime**: Proper health checks prevent issues

## Testing Your Deployment

### Health Check

```bash
curl https://your-project-name.railway.app/health
```

### WebSocket Test

```bash
# Test WebSocket connection
node test-websocket.js
```

## Cost

- **Free Tier**: 500 hours/month (20+ days)
- **Paid**: $5/month if you exceed free tier
- **Cancel anytime**: No commitment

## Troubleshooting

### If deployment fails:

1. Check Railway logs in dashboard
2. Verify `GROQ_API_KEY` is set
3. Ensure TypeScript builds successfully

### If WebSocket doesn't work:

1. Check Railway logs for errors
2. Verify CORS settings
3. Test with the provided test script

## Next Steps

1. **Deploy to Railway** (2 minutes)
2. **Test the endpoints**
3. **Update client WebSocket URL** to your Railway domain
4. **Demo ready!** 🎉

## Railway Dashboard

- **Logs**: Real-time server logs
- **Metrics**: CPU, memory usage
- **Variables**: Environment variables
- **Deployments**: Deployment history
