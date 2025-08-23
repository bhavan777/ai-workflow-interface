#!/bin/bash

echo "🚀 Railway Deployment Script"
echo "============================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the server directory."
    exit 1
fi

echo "✅ Server directory confirmed"

# Build the project
echo "🔨 Building TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix TypeScript errors first."
    exit 1
fi

echo "✅ Build successful"

# Check if GROQ_API_KEY is set
if [ -z "$GROQ_API_KEY" ]; then
    echo "⚠️  Warning: GROQ_API_KEY not set in environment"
    echo "   You'll need to set it in Railway dashboard after deployment"
else
    echo "✅ GROQ_API_KEY is set"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Go to https://railway.app"
echo "2. Create new project from GitHub repo"
echo "3. Set environment variables in Railway dashboard:"
echo "   - GROQ_API_KEY=your_key_here"
echo "   - NODE_ENV=production"
echo "   - PORT=3001"
echo "4. Railway will auto-deploy!"
echo ""
echo "📖 See RAILWAY_DEPLOYMENT.md for detailed instructions"
