# AI Integration 🤖

The HomeGarden API leverages advanced AI models to provide intelligent plant care features. This document outlines the models used, configuration, and operational constraints.

## 🧠 Models & Providers

We utilize **Google Gemini** via the Google Generative AI SDK for multimodal tasks (text + images).

### 1. Plant Identification (`/api/plant/identify`)
*   **Purpose**: Identify plant species from user-uploaded images.
*   **Model**: `gemini-2.0-flash` (Configurable via `GEMINI_IDENTIFICATION_MODEL`)
*   **Why**: Optimized for speed and low latency, suitable for quick identification tasks.

### 2. Dr. Plant Diagnosis (`/api/dr-plant/diagnose`)
*   **Purpose**: Analyze images of sick plants to diagnose diseases, pests, or deficiencies and recommend treatment.
*   **Model**: `gemini-2.5-pro-preview-06-05` (Configurable via `GEMINI_DIAGNOSIS_MODEL`)
*   **Why**: Higher reasoning capabilities required for complex medical/botanical diagnosis.

## ⚙️ Configuration

The following environment variables control AI behavior (see `docs/ENV.md` for full details):

| Variable | Description | Default |
|---|---|---|
| `GOOGLE_AI_API_KEY` | API Key for Google Gemini. | Required for AI features |
| `GEMINI_IDENTIFICATION_MODEL` | Model ID for identification. | `gemini-2.0-flash` |
| `GEMINI_DIAGNOSIS_MODEL` | Model ID for diagnosis. | `gemini-2.5-pro-preview-06-05` |
| `PLANTNET_API_KEY` | (Optional) Backup provider for identification. | - |

## 🚦 Rate Limiting & Costs

AI endpoints are resource-intensive and costly. We implement strict rate limiting distinct from the global API limits.

*   **Middleware**: `aiRateLimitMiddleware`
*   **Limit**: **10 requests per minute** per user/IP.
*   **Header**: `X-RateLimit-AI-Limit`, `X-RateLimit-AI-Remaining`.

### Cost Control Strategy
1.  **Strict Rate Limits**: Prevents abuse and accidental over-usage.
2.  **Caching**: Successful identifications and diagnoses should be cached where possible (implementation dependent).
3.  **Model Selection**: We use "Flash" models for high-volume tasks (ID) and "Pro" models only for high-value tasks (Diagnosis).

## 📦 JSON Schemas

The AI adapters are instructed to return structured JSON data.

### Diagnosis Response Structure
```json
{
  "healthy": boolean,
  "disease": "string | null",
  "confidence": number, // 0.0 - 1.0
  "symptoms": ["string"],
  "treatment": {
    "chemical": ["string"],
    "organic": ["string"],
    "prevention": ["string"]
  }
}
```
