# Render Deployment Guide

## Prerequisites

1. GitHub repository with your server code
2. Google AI API key
3. Render account (free)

## Step 1: Prepare Your Code

- Ensure all code is committed to GitHub
- Verify `render.yaml` is in the server directory
- Check that `GOOGLE_AI_API_KEY` environment variable is used in your code

## Step 2: Deploy to Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ai-workflow-server`
   - **Root Directory**: `server` (if your server is in a subdirectory)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

## Step 3: Environment Variables

Add these environment variables in Render dashboard:

- `GOOGLE_AI_API_KEY`: Your Google AI API key
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render will override this)

## Step 4: Deploy

1. Click "Create Web Service"
2. Wait for build and deployment (5-10 minutes)
3. Note your service URL (e.g., `https://ai-workflow-server.onrender.com`)

## Step 5: Test

1. Visit your service URL + `/health` (e.g., `https://ai-workflow-server.onrender.com/health`)
2. Should return: `{"status":"ok","timestamp":"..."}`

## Step 6: Update API Docs

Update `api-docs.html` with your Render WebSocket URL:

```javascript
const wsUrl = 'wss://ai-workflow-server.onrender.com';
```

## Troubleshooting

- Check build logs in Render dashboard
- Verify environment variables are set
- Ensure all dependencies are in `package.json`
- Check that TypeScript builds successfully
