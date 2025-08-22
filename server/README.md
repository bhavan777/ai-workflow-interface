# AI Workflow Interface - Backend Server

A Node.js/TypeScript backend server for the AI Workflow Interface, providing intelligent data pipeline creation through natural language processing.

## 🚀 Features

- **🤖 Groq Cloud Integration**: Intelligent model selection (LLaMA 3.1 8B, LLaMA 3.3 70B)
- **📊 3-Node Workflow Structure**: Enforced source → transform → destination pattern
- **📈 Status Management**: Complete status progression (pending → partial → complete)
- **🔄 Retry Logic**: Automatic retry with exponential backoff for API failures
- **💾 Data Persistence**: File system with in-memory fallback
- **🔒 API Validation**: Automatic Groq API key validation
- **📡 WebSocket Support**: Real-time communication
- **🏥 Health Monitoring**: Comprehensive health checks

## 🛠️ Setup

### Prerequisites
- Node.js 18+ 
- Groq Cloud API key

### Installation

1. **Clone and install dependencies:**
```bash
cd server
npm install
```

2. **Set up environment variables:**
```bash
cp env.example .env
# Edit .env and add your GROQ_API_KEY
```

3. **Get your Groq Cloud API key:**
   - Visit [Groq Console](https://console.groq.com/)
   - Create a free account
   - Generate an API key (starts with `gsk_`)

4. **Start the server:**
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GROQ_API_KEY` | Groq Cloud API key | ✅ | - |
| `PORT` | Server port | ❌ | 3001 |
| `NODE_ENV` | Environment | ❌ | development |
| `DEBUG` | Enable debug logging | ❌ | false |

### Model Selection

The system automatically selects the best Groq model:

- **🚀 LLaMA 3.1 8B Instant**: Fast, simple tasks
- **⚡ LLaMA 3.1 8B**: Balanced performance  
- **🧠 LLaMA 3.3 70B**: Complex workflows

## 📡 API Endpoints

### Health Check
```bash
GET /health
```
Returns server and Groq API health status.

### AI Workflow
```bash
POST /api/ai/start
POST /api/ai/continue
```

### WebSocket
```bash
ws://localhost:3001
```

## 🚀 Deployment

### Render (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm start
```

## 🔍 Troubleshooting

### Common Issues

**❌ "GROQ_API_KEY environment variable is required"**
- Ensure your API key is set in environment variables
- Check that the key starts with `gsk_`

**❌ "Invalid GROQ_API_KEY format"**
- Verify your API key starts with `gsk_`
- Regenerate the key in Groq Console if needed

**❌ "Groq API key validation failed"**
- Check your internet connection
- Verify the API key is valid and has credits
- Check Groq service status

**❌ "File system save failed"**
- The system will automatically use in-memory storage
- This is normal in production environments

**❌ "All retry attempts failed"**
- Check Groq API status
- Verify your API key has sufficient credits
- Try again in a few minutes

### Health Check Response

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "groq_api": "healthy"
}
```

### Logs

Monitor logs for:
- `✅ Groq API key validated successfully`
- `⚠️ Groq API key validation failed`
- `🔄 Attempt X/3 to call Groq Cloud...`
- `✅ All conversations cleared`

## 📊 Performance

- **Response Time**: 2-10 seconds (depending on model)
- **Retry Logic**: 3 attempts with exponential backoff
- **Timeout**: 60 seconds per request
- **Memory Usage**: ~50MB base + conversation storage

## 🔒 Security

- CORS protection for web clients
- Rate limiting on API endpoints
- API key validation on startup
- Graceful error handling

## 📝 License

ISC License
