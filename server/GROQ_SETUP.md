# 🚀 Groq Cloud Setup Guide

## Quick Setup (2 minutes)

### 1. Get Free Groq Cloud API Key

1. Visit: [https://console.groq.com/](https://console.groq.com/)
2. Sign up with your email (free)
3. Create a new API key
4. Copy the key (starts with `gsk-`)

### 2. Configure Environment

```bash
# Copy the example file
cp env.example .env

# Edit .env and add your Groq Cloud key
GROQ_API_KEY=gsk-your-actual-key-here
```

### 3. Test the Setup

```bash
# Build the project
npm run build

# Start the server
npm run dev

# In another terminal, run the test
npm test
```

## Intelligent Model Selection

The system **automatically** selects the best model for each task:

| Model            | Used For                | When Selected                                   |
| ---------------- | ----------------------- | ----------------------------------------------- |
| **Gemma 7B**     | Simple, fast tasks      | Quick questions, basic requests < 100 chars     |
| **Mixtral 8x7B** | Balanced performance    | Most workflows, standard complexity             |
| **LLaMA-2 70B**  | Complex, detailed tasks | Complex integrations, long requests > 200 chars |

## Why Groq Cloud?

- **🆓 Completely Free**: Unlimited access to multiple models
- **⚡ Ultra-Fast**: Specialized inference hardware
- **🎯 Smart Model Selection**: Automatically picks the best model for each task
- **🔄 No Quotas**: No rate limiting headaches
- **💪 Production Ready**: Great for development and demos
- **🚀 Beta Access**: Cutting-edge models and features

## How It Works

The system analyzes your request and automatically selects the best model:

- **Simple/Fast Tasks**: Keywords like "quick", "simple", "test" + short messages → **Gemma 7B**
- **Complex Tasks**: Keywords like "complex", "integration", "pipeline" + long messages → **LLaMA-2 70B**
- **Everything Else**: Standard workflows and balanced needs → **Mixtral 8x7B**

**No configuration needed** - it just works! 🎯

## Troubleshooting

### "GROQ_API_KEY environment variable is required"

- Make sure you copied `env.example` to `.env`
- Check that your API key starts with `gsk-`
- Restart the server after adding the key

### "Groq Cloud API error: 401"

- Your API key is invalid or expired
- Generate a new key at https://console.groq.com/

### "Timeout waiting for response"

- Groq Cloud might be experiencing high load
- Try again in a few seconds
- Check your internet connection

## Next Steps

Once Groq Cloud is working:

1. Test with a simple workflow: "Connect Shopify to Snowflake"
2. Try different complexity levels and see the automatic model selection
3. Build your own data pipelines
4. Scale up with more complex integrations

## Examples of Model Selection

- "Quick test" → **Gemma 7B** (fast response)
- "Connect Shopify to Snowflake" → **Mixtral 8x7B** (balanced)
- "Create a complex multi-database integration pipeline with transformations" → **LLaMA-2 70B** (complex)

Happy building! 🎉
