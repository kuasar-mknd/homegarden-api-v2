# AI Integration

HomeGarden leverages Google Gemini Vision models to provide advanced plant identification and health diagnosis capabilities.

## 🤖 Models Configured

The specific models are configurable via environment variables to allow for easy upgrades or testing different model versions.

| Feature | Env Variable | Default Model | Description |
|---|---|---|---|
| **Plant Identification** | `GEMINI_IDENTIFICATION_MODEL` | `gemini-2.0-flash` | Optimized for speed and general object recognition. |
| **Plant Diagnosis** | `GEMINI_DIAGNOSIS_MODEL` | `gemini-2.5-pro-preview-06-05` | A more capable model for complex reasoning and detailed analysis. |

## 🔑 Configuration

To enable AI features, you must provide a Google AI API key:

```bash
GOOGLE_AI_API_KEY=your_api_key_here
```

## 📋 JSON Schemas

The application instructs the AI to return structured JSON data.

### Identification Schema
```json
{
  "name": "Monstera Deliciosa",
  "confidence": 0.95,
  "details": "A tropical plant with holey leaves...",
  "care_tips": ["Indirect light", "Water weekly"]
}
```

### Diagnosis Schema
```json
{
  "condition": "Root Rot",
  "severity": "high",
  "description": "Roots are turning brown and mushy due to overwatering.",
  "treatment": ["Repot immediately", "Trim affected roots", "Reduce watering frequency"]
}
```

## 💰 Cost Control Strategy

To manage costs and latency:

1.  **Strict Rate Limiting**: The API enforces rate limits per user/IP (configured via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`).
2.  **Stateless**: The AI service is stateless; no conversation history is maintained to minimize token usage.
3.  **JSON Mode**: We strictly request JSON output to avoid verbose, unstructured text responses.
