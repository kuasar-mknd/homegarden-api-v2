# AI Integration

HomeGarden uses Google Gemini for its core AI features: **Plant Identification** and **Dr. Plant (Diagnosis)**.

## Models

Configuration is handled via environment variables, allowing flexibility to switch models without code changes.

| Feature | Default Model | Env Variable |
|---|---|---|
| **Identification** | `gemini-2.0-flash` | `GEMINI_IDENTIFICATION_MODEL` |
| **Diagnosis** | `gemini-2.5-pro-preview-06-05` | `GEMINI_DIAGNOSIS_MODEL` |

## Adapter Architecture

The AI integration is managed by the `GeminiPlantAdapter` (Infrastructure Layer), which implements the `AIPlantService` interface (Domain Layer). This ensures that the domain logic is decoupled from the specific AI provider.

### JSON Schemas

The application enforces structured JSON output from the LLM to ensure reliable parsing.

**Identification Output:**
```json
{
  "commonName": "Monstera",
  "scientificName": "Monstera deliciosa",
  "family": "Araceae",
  "confidence": 0.95,
  "description": "A popular tropical houseplant..."
}
```

**Diagnosis Output:**
```json
{
  "healthy": false,
  "disease": "Root Rot",
  "confidence": 0.85,
  "symptoms": ["yellow leaves", "mushy roots"],
  "treatment": "Reduce watering, repot in well-draining soil.",
  "prevention": "Ensure pot has drainage holes."
}
```

## Cost Control & Rate Limiting

To prevent excessive costs and abuse, AI endpoints have specific protections:

1.  **Rate Limiting**: AI endpoints are subject to a stricter rate limit than the rest of the API.
2.  **Caching**: Diagnosis results for the same image (hash) or plant ID are cached where possible (implementation dependent).
3.  **Payload Size**: Image uploads are limited to avoid processing unnecessarily large files.
4.  **Token Limits**: Prompts are optimized to use the minimum necessary context window.
