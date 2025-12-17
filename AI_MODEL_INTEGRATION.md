# AI Model Integration Guide - Claude & Grok

BrainSpark now supports **multiple AI models** with automatic failover capability! You can choose between Anthropic's Claude and xAI's Grok, or let the system automatically switch between them for reliability.

## Supported Models

### 1. **Claude Sonnet 4** (Anthropic)
- Default model
- Model ID: `claude-sonnet-4-20250514`
- Best for: Educational content, thoughtful responses, safety
- API: https://api.anthropic.com

### 2. **Grok 2** (xAI)
- Failover model
- Model ID: `grok-2-latest`
- Best for: Creative responses, real-time knowledge
- API: https://api.x.ai

---

## Configuration

### 1. Get API Keys

#### Claude API Key:
1. Visit https://console.anthropic.com
2. Create an account or sign in
3. Generate an API key from your dashboard
4. Copy the key starting with `sk-ant-...`

#### Grok API Key:
1. Visit https://console.x.ai
2. Create an account or sign in
3. Generate an API key
4. Copy the key starting with `xai-...`

### 2. Update Environment Variables

Edit `backend/.env`:

```env
# AI API Keys
# Anthropic Claude API (get from https://console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-your-actual-claude-key-here

# Grok API (xAI - get from https://console.x.ai)
GROK_API_KEY=xai-your-actual-grok-key-here

# Default AI Model (claude or grok)
DEFAULT_AI_MODEL=claude
```

### 3. Set Default Model

The `DEFAULT_AI_MODEL` setting determines which model is used first when no preference is specified:
- `claude` - Use Claude as primary, Grok as fallback (recommended)
- `grok` - Use Grok as primary, Claude as fallback

---

## How Failover Works

The system implements intelligent failover:

1. **Primary Model Attempt**: Tries your preferred or default model first
2. **Automatic Failover**: If primary fails, automatically tries the other model
3. **Fallback Response**: If both APIs fail, provides static educational responses

Example flow:
```
User sends message
  ↓
Try Claude API
  ↓ (if fails)
Try Grok API
  ↓ (if fails)
Return static fallback
```

---

## API Usage

### Backend API Endpoint

**POST** `/api/chat`

```json
{
  "topic": "Space",
  "message": "Why is the sky blue?",
  "age_group": "explorers",
  "conversation_id": "optional-uuid",
  "preferred_model": "grok",        // Optional: "claude" or "grok"
  "enable_fallback": true           // Optional: Enable/disable failover
}
```

**Response:**
```json
{
  "response": "AI generated response...",
  "conversation_id": "uuid",
  "depth": 1,
  "stars_earned": 5,
  "achievement": null,
  "model_used": "grok"              // Shows which model answered
}
```

### Frontend API Client

```typescript
import { chatApi } from './api/client'

// Use default model (from .env)
await chatApi.sendMessage({
  topic: 'Space',
  message: 'Why is the sky blue?',
  age_group: 'explorers'
})

// Specify model preference
await chatApi.sendMessage({
  topic: 'Space',
  message: 'Why is the sky blue?',
  age_group: 'explorers',
  preferred_model: 'grok',          // Force Grok
  enable_fallback: true             // Allow Claude if Grok fails
})

// Disable failover (use only specified model)
await chatApi.sendMessage({
  topic: 'Space',
  message: 'Why is the sky blue?',
  age_group: 'explorers',
  preferred_model: 'claude',
  enable_fallback: false            // Don't try other models
})
```

---

## Testing the Integration

### 1. Test with Placeholder Keys (Failover Test)

Leave placeholder keys in `.env`:
```env
ANTHROPIC_API_KEY=your-api-key-here
GROK_API_KEY=your-grok-api-key-here
```

Both will fail → system returns static fallback responses

### 2. Test with One Real Key

Set only Grok key:
```env
ANTHROPIC_API_KEY=your-api-key-here
GROK_API_KEY=xai-your-real-key
DEFAULT_AI_MODEL=grok
```

Grok works → Claude fails → Grok responds successfully

### 3. Test with Both Keys

Set both keys:
```env
ANTHROPIC_API_KEY=sk-ant-your-real-key
GROK_API_KEY=xai-your-real-key
DEFAULT_AI_MODEL=claude
```

Full redundancy → Primary succeeds or fails over to secondary

### 4. API Testing

```bash
# Test backend is running
curl http://localhost:8000/docs

# Test chat endpoint (requires auth token)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "topic": "Space",
    "message": "Why is the sky blue?",
    "age_group": "explorers",
    "preferred_model": "grok"
  }'
```

---

## Model Selection Strategy

### When to use Claude:
- Educational content for younger children
- Safety-critical responses
- Detailed explanations
- Need for structured thinking

### When to use Grok:
- Real-time information
- Creative exploration
- Alternative perspectives
- Testing redundancy

### Recommended Setup:
```env
DEFAULT_AI_MODEL=claude          # Claude primary
ANTHROPIC_API_KEY=sk-ant-...    # Claude key
GROK_API_KEY=xai-...             # Grok as backup
```

This provides:
- Best educational quality (Claude)
- High availability (Grok failover)
- Cost efficiency (one primary, one backup)

---

## Monitoring

Check backend logs to see which model is being used:

```bash
# Backend will log:
"Claude API Error: ..." - When Claude fails
"Grok API Error: ..." - When Grok fails
"Claude failed, trying Grok as fallback..." - Failover triggered
"Grok failed, trying Claude as fallback..." - Failover triggered
```

The API response includes `model_used` field:
- `"claude"` - Claude responded
- `"grok"` - Grok responded
- `"fallback"` - Static response used

---

## Cost Considerations

### API Pricing (as of 2025):

**Claude Sonnet 4:**
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

**Grok 2:**
- Check https://x.ai/pricing for current rates

### Cost Optimization:

1. **Use Default Model Wisely**: Set cheaper model as default
2. **Disable Fallback for Testing**: Use `enable_fallback: false`
3. **Monitor Usage**: Check API dashboards regularly
4. **Cache Responses**: Consider implementing response caching

---

## Troubleshooting

### "Both APIs failed" error:
- Check API keys are correct
- Verify internet connectivity
- Check API quotas/limits
- Review backend logs

### "Model not responding":
- Try the other model
- Check model availability status
- Verify API endpoint URLs

### Slow responses:
- Normal: AI responses take 2-5 seconds
- Check timeout settings (default: 30s)
- Monitor API latency

---

## Security Best Practices

1. **Never commit API keys** to git
2. **Use environment variables** for all keys
3. **Rotate keys regularly**
4. **Monitor usage** for unusual activity
5. **Set spending limits** in API dashboards

---

## Future Enhancements

Potential additions:
- [ ] OpenAI GPT integration
- [ ] Google Gemini integration
- [ ] Response caching layer
- [ ] Model performance analytics
- [ ] Cost tracking dashboard
- [ ] A/B testing between models
- [ ] User preference storage

---

## Support

For issues or questions:
- Backend issues: Check `backend/app/main.py` lines 236-390
- Frontend issues: Check `frontend/src/api/client.ts`
- API docs: http://localhost:8000/docs

Happy Learning! 🧠✨
