# AI Integration Documentation

HomeGarden API uses **Google Gemini Vision** models for intelligent plant identification and disease diagnosis capabilities.

## 🤖 AI Features

### 1. Plant Species Identification
- Upload a photo of a plant
- Get species suggestions with confidence scores
- Includes scientific name, family, origin, and care tips
- Supports location-aware suggestions

### 2. Disease Diagnosis (Dr. Plant)
- Analyze plant health from images
- Identify diseases, pests, and deficiencies
- Get treatment recommendations (organic & chemical)
- Severity assessment and recovery time estimates

---

## 🔧 Models & Configuration

| Feature | Default Model | Env Variable | Purpose |
|---------|--------------|--------------|---------|
| **Plant ID** | `gemini-2.0-flash` | `GEMINI_IDENTIFICATION_MODEL` | Fast visual recognition |
| **Dr. Plant** | `gemini-2.5-pro-preview-06-05` | `GEMINI_DIAGNOSIS_MODEL` | Complex reasoning & diagnosis |

> **Flexibility:** Change models via environment variables without redeployment

---

## 🔑 Setup

1. **Get an API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create a new API key
   - Copy the key

2. **Configure Environment**
   ```env
   GOOGLE_AI_API_KEY=your-api-key-here
   GEMINI_IDENTIFICATION_MODEL=gemini-2.0-flash
   GEMINI_DIAGNOSIS_MODEL=gemini-2.5-pro-preview-06-05
   ```

3. **Verify Setup**
   ```bash
   curl http://localhost:3000/api/v2/plant-id/status \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

---

## 🧠 Architecture

The AI integration follows the **Adapter Pattern** for clean separation:

```
Application Layer (Port)
    ↓
AIIdentificationPort Interface
    ↓
GeminiPlantAdapter (Infrastructure)
    ↓
Google Gemini API
```

**Benefits:**
- ✅ Switch AI providers easily (Gemini → OpenAI)
- ✅ Testable (mock the port in tests)
- ✅ Business logic independent of AI provider

**Implementation:**

```typescript
// Application layer - defines contract
interface AIIdentificationPort {
  identifySpecies(request: IdentifyRequest): Promise<Result<IdentifyResult>>
}

// Infrastructure layer - implements it
class GeminiPlantAdapter implements AIIdentificationPort {
  async identifySpecies(request: IdentifyRequest) {
    // Call Google Gemini
    // Parse response
    // Return structured data
  }
}
```

---

## 📤 Input Formats

### URL-based
```json
{
  "imageUrl": "https://example.com/plant.jpg",
  "maxSuggestions": 5
}
```

### Base64-based
```json
{
  "imageBase64": "iVBORw0KGgoAAAANS...",
  "mimeType": "image/jpeg"
}
```

### With Location Context
```json
{
  "imageUrl": "https://...",
  "location": {
    "latitude": 46.5196535,
    "longitude": 6.6322734,
    "country": "Switzerland"
  }
}
```

---

## 📥 Output Formats

### Plant Identification Response
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "confidence": 0.98,
        "commonName": "Swiss Cheese Plant",
        "scientificName": "Monstera deliciosa",
        "family": "Araceae",
        "genus": "Monstera",
        "description": "A species of flowering plant native to...",
        "origin": "Central America",
        "nativeRegions": ["Mexico", "Panama"],
        "care": {
          "light": "Bright indirect light",
          "water": "Weekly, let soil dry between watering",
          "humidity": "60-80%",
          "temperature": "18-27°C"
        },
        "imageUrl": "https://..."
      }
    ],
    "processingTimeMs": 1245,
    "modelUsed": "gemini-2.0-flash"
  }
}
```

### Diagnosis Response
```json
{
  "success": true,
  "data": {
    "isHealthy": false,
    "confidence": 0.92,
    "conditionName": "Leaf Septoria",
    "conditionType": "DISEASE",
    "severity": "MODERATE",
    "affectedParts": ["leaves"],
    "causes": [
      "Fungal infection (Septoria lycopersici)",
      "High humidity",
      "Poor air circulation"
    ],
    "symptoms": [
      "Small circular spots on leaves",
      "Yellow halos around spots",
      "Brown lesions"
    ],
    "treatmentSteps": [
      "Remove all infected leaves immediately",
      "Apply copper-based fungicide",
      "Improve air circulation around plant",
      "Reduce watering frequency"
    ],
    "preventionTips": [
      "Avoid overhead watering",
      "Space plants adequately",
      "Ensure good ventilation"
    ],
    "organicTreatment": "Neem oil spray every 7-10 days",
    "chemicalTreatment": "Copper fungicide (follow label instructions)",
    "recoveryTimeWeeks": 2,
    "criticalActions": [
      "Isolate plant to prevent spread to other plants"
    ],
    "processingMs": 2456,
    "aiModel": "gemini-2.5-pro-preview-06-05"
  }
}
```

---

## 🎯 Prompt Engineering

The system uses carefully crafted prompts to ensure consistent, structured JSON responses:

### Identification Prompt Structure
1. Role definition (plant expert botanist)
2. Task description
3. JSON schema specification
4. Output format enforcement
5. Context (location, visible organs)

### Diagnosis Prompt Structure
1. Role definition (plant pathologist)
2. Symptom analysis guidelines
3. Treatment recommendation framework
4. Severity classification rules
5. JSON schema enforcement

---

## 💰 Cost Management

### Current Implementation
- ❌ **No caching** - Every request hits Gemini API
- ✅ **Rate limiting** - Global API rate limiter (configurable)
- ✅ **Image optimization** - Client-side resizing recommended

### Cost Optimization Tips
1. **Implement caching** for identical images
2. **Resize images** before upload (recommended max: 1024px)
3. **Use URL-based** identification when possible (vs base64)
4. **Batch requests** for multiple plants
5. **Monitor usage** via Google Cloud Console

---

## 🧪 Testing

AI adapters are thoroughly tested with mocked Gemini responses:

```typescript
// tests/adapters/gemini-plant.adapter.test.ts
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class MockGenAI {
    getGenerativeModel() {
      return {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({
              success: true,
              suggestions: [...]
            })
          }
        })
      }
    }
  }
}))
```

**Coverage:**
- ✅ Valid AI responses
- ✅ Invalid JSON handling
- ✅ API errors
- ✅ Timeout scenarios
- ✅ Location-aware identification

---

## ⚠️ Error Handling

### Common Errors

**AI Service Not Configured**
```json
{
  "success": false,
  "error": "AI_NOT_CONFIGURED",
  "message": "Google AI API key is not set"
}
```

**Invalid Image Format**
```json
{
  "success": false,
  "error": "INVALID_IMAGE",
  "message": "Unsupported image format. Use JPEG, PNG, or WEBP"
}
```

**AI Response Parse Error**
```json
{
  "success": false,
  "error": "AI_PARSE_ERROR",
  "message": "Failed to parse AI response as JSON"
}
```

**Rate Limit Exceeded**
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Try again later"
}
```

---

## 🔍 Troubleshooting

### "AI service not configured"
- ✅ Check `GOOGLE_AI_API_KEY` is set in `.env`
- ✅ Verify API key is valid in Google AI Studio
- ✅ Restart server after changing `.env`

### "Invalid AI response format"
- Model returned non-JSON or malformed JSON
- Try upgrading to a newer model version
- Check if the prompt engineering needs adjustment

### Slow Response Times
- Consider using Flash models for faster inference
- Optimize image size before upload
- Implement response caching

### Incorrect Identifications
- Provide better quality images
- Include location context
- Specify visible organs (flower, leaf, etc.)
- Try different lighting or angles

---

## 🚀 Future Enhancements

- [ ] Implement response caching (Redis)
- [ ] Add vision-based plant counting
- [ ] Multi-image analysis for better accuracy
- [ ] Real-time streaming responses
- [ ] Fine-tuned custom models for specific plant families

---

**The AI integration is designed to be flexible, testable, and provider-agnostic through clean architecture patterns.**
