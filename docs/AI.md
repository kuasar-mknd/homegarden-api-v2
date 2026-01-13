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
  "success": true,
  "suggestions": [
    {
      "confidence": 0.95,
      "commonName": "English Ivy",
      "scientificName": "Hedera helix",
      "family": "Araliaceae",
      "genus": "Hedera",
      "description": "Evergreen climbing or ground-creeping vine",
      "origin": "Europe and Western Asia",
      "imageUrl": "https://..."
    }
  ]
}
```

### Diagnosis Schema
```json
{
  "success": true,
  "isHealthy": false,
  "confidence": 0.87,
  "condition": {
    "name": "Powdery Mildew",
    "type": "DISEASE",
    "severity": "MODERATE",
    "scientificName": "Erysiphales"
  },
  "affectedParts": ["leaves"],
  "symptoms": ["White powdery coating on leaves", "Yellowing leaf margins"],
  "causes": ["High humidity", "Poor air circulation", "Fungal spores"],
  "treatments": [
    {
      "priority": 1,
      "action": "Remove affected leaves",
      "instructions": "Carefully prune and dispose of heavily infected leaves. Do not compost.",
      "frequency": "once",
      "products": ["Neem oil", "Potassium bicarbonate"]
    },
    {
      "priority": 2,
      "action": "Apply fungicide",
      "instructions": "Spray neem oil solution on remaining foliage",
      "frequency": "weekly for 3 weeks",
      "products": ["Neem oil", "Potassium bicarbonate"]
    }
  ],
  "organicTreatment": "Mix 1 tbsp baking soda + 1 tbsp vegetable oil + 1 gallon water. Spray weekly.",
  "chemicalTreatment": "Apply sulfur-based fungicide according to package instructions.",
  "preventionTips": ["Improve air circulation", "Avoid overhead watering", "Space plants properly"],
  "urgentActions": [],
  "recoveryTimeWeeks": 3,
  "notes": "Caught early. Good prognosis with proper treatment."
}
```

## 💰 Cost Control Strategy

To manage costs and latency:

1.  **Strict Rate Limiting**: The API enforces rate limits per user/IP (configured via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`).
2.  **Stateless**: The AI service is stateless; no conversation history is maintained to minimize token usage.
3.  **JSON Mode**: We strictly request JSON output to avoid verbose, unstructured text responses.
