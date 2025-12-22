# AI Integration Guide

HomeGarden API uses **Google Gemini Vision** for intelligent plant analysis.

---

## 🤖 Models & Configuration

The application uses different models for specific tasks to balance speed, cost, and accuracy.

| Task | Env Variable | Default Model | Purpose |
|------|--------------|---------------|---------|
| **Identification** | `GEMINI_IDENTIFICATION_MODEL` | `gemini-2.0-flash` | Fast, efficient image analysis for species ID. |
| **Diagnosis** | `GEMINI_DIAGNOSIS_MODEL` | `gemini-2.5-pro-preview-06-05` | High-reasoning model for complex disease analysis. |

### Configuration

Set these in your `.env` file:

```env
GOOGLE_AI_API_KEY=your-api-key
GEMINI_IDENTIFICATION_MODEL=gemini-2.0-flash
GEMINI_DIAGNOSIS_MODEL=gemini-2.5-pro-preview-06-05
```

---

## 🧠 Features

### 1. Plant Identification

- **Endpoint**: `POST /api/v2/plant-id/identify`
- **Input**: Image URL (or base64)
- **Output**: JSON containing:
  - Species name (Common & Scientific)
  - Confidence score
  - Description
  - Care requirements

### 2. Disease Diagnosis (Dr. Plant)

- **Endpoint**: `POST /api/v2/dr-plant/diagnose`
- **Input**: Image URL + Optional user observation text
- **Output**: JSON containing:
  - Diagnosis (Health status)
  - Disease name (if any)
  - Confidence
  - Treatment recommendations
  - Prevention tips

---

## 🛡️ Security & Safety

- **SSRF Protection**: Image URLs are validated to prevent Server-Side Request Forgery.
- **Content Safety**: Gemini's built-in safety settings block harmful/explicit content.
- **Prompt Engineering**: System instructions utilize strict JSON schemas to ensure reliable structured output.

---

## 💰 Cost Control & Optimization

1. **Caching**: Results for identical image URLs *should be* cached (implementation dependent) to avoid redundant API calls.
2. **Rate Limiting**: The API applies rate limits (`RATE_LIMIT_MAX`) to prevent abuse.
3. **Model Selection**: `flash` models are used by default for high-volume tasks (identification) to minimize costs.

---

## 🧪 Testing with AI

- **Integration Tests**: Mock the `IGenerativeAI` adapter or the Google API response to avoid real costs during CI.
- **Live Tests**: Use the `google-ai-studio` playground to verify prompt performance before updating the codebase.

---

## 📝 Example Response (Diagnosis)

```json
{
  "isHealthy": false,
  "disease": "Powdery Mildew",
  "confidence": 0.95,
  "symptoms": [
    "White powdery spots on leaves",
    "Yellowing leaves"
  ],
  "treatment": [
    "Remove infected leaves",
    "Apply fungicide (neem oil)"
  ],
  "prevention": [
    "Improve air circulation",
    "Avoid overhead watering"
  ]
}
```
