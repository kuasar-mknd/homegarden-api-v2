# API Documentation

## 🪴 Plant Identification

### `POST /api/v2/plant-id/identify`

Identifies a plant from an image URL or base64 data.

**Request Body:**
```json
{
  "image": "https://example.com/flower.jpg",
  "isUrl": true,
  "maxSuggestions": 3
}
```
*OR (Base64)*
```json
{
  "image": "iVBORw0KGgo...",
  "isUrl": false,
  "mimeType": "image/jpeg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "suggestions": [
    {
      "confidence": 0.98,
      "commonName": "Sunflower",
      "scientificName": "Helianthus annuus",
      "family": "Asteraceae"
    }
  ]
}
```

---

### `GET /api/v2/plant-id/status`

Checks if the AI service is configured and reachable.

**Response:**
```json
{
  "status": "online",
  "model": "gemini-1.5-flash"
}
```

---

## 🏥 Dr. Plant (Diagnosis)

### `POST /api/v2/dr-plant/diagnose`

Diagnoses plant health issues from an image.

**Limits:** Max payload 10MB.

**Request Body:**
```json
{
  "image": "https://example.com/sick-plant.jpg",
  "isUrl": true,
  "symptomDescription": "Leaves are turning yellow with brown spots"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "isHealthy": false,
  "condition": {
    "name": "Leaf Septoria",
    "type": "DISEASE",
    "severity": "MODERATE"
  },
  "treatments": [
    {
      "priority": 1,
      "action": "Prune infected leaves",
      "instructions": "Remove leaves with spots to prevent spread."
    }
  ]
}
```

---

## 🔒 Authentication

Currently, the API expects a **Bearer Token** in the `Authorization` header for protected routes (if any).

`Authorization: Bearer <your-jwt>`

> **Note:** Error responses follow standard HTTP codes (400, 401, 403, 404, 500) and return a JSON object with `success: false` and `error` message.
