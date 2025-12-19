# AI Integration Documentation

HomeGarden API uses **Google Gemini Vision** models for plant identification and disease diagnosis.

## 🤖 Models & Configuration

The application uses different models for specific tasks to optimize for speed vs. reasoning capability.

| Feature | Default Model | Config Env Var | Purpose |
|---|---|---|---|
| **Plant ID** | `gemini-3-flash-preview` | `GEMINI_IDENTIFICATION_MODEL` | Fast visual recognition |
| **Dr. Plant** | `gemini-3-flash-preview` | `GEMINI_DIAGNOSIS_MODEL` | Complex reasoning & diagnosis |

> **Note:** The code is flexible. You can change models by updating the environment variables without redeploying.

## 🔑 Setup

1. Get an API Key from [Google AI Studio](https://aistudio.google.com/).
2. Set `GOOGLE_AI_API_KEY` in your `.env` file.

## 🧠 JSON Schema Output

The application uses **Prompt Engineering** to force the AI to return strict JSON.

### Plant Identification Output
```json
{
  "success": true,
  "suggestions": [
    {
      "confidence": 0.95,
      "commonName": "English Ivy",
      "scientificName": "Hedera helix",
      "family": "Araliaceae"
    }
  ]
}
```

### Dr. Plant Diagnosis Output
```json
{
  "success": true,
  "isHealthy": false,
  "condition": {
    "name": "Powdery Mildew",
    "type": "DISEASE",
    "severity": "MODERATE"
  },
  "treatments": [
    {
      "priority": 1,
      "action": "Remove affected leaves",
      "instructions": "..."
    }
  ]
}
```

## 🛡 Cost & Rate Limiting

- **Caching**: Currently, there is **NO** caching layer for AI requests. Every request hits the Google API.
- **Rate Limiting**: The API uses a global rate limiter (configurable via `RATE_LIMIT_MAX`).
- **Optimization**: Images are processed as base64 or URLs. Large images should be resized client-side before upload to reduce latency and bandwidth.

## ⚠️ Troubleshooting

- **"AI service not configured"**: Check if `GOOGLE_AI_API_KEY` is set.
- **"Invalid AI response format"**: The model failed to output valid JSON. This can happen with smaller/older models. Try upgrading to a newer model version.
