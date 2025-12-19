# API Documentation

> **Interactive Documentation**: Visit `/ui` for Swagger UI or `/doc` for raw OpenAPI spec

## 🔐 Authentication

All protected endpoints require a **Bearer Token** (JWT) from Supabase Auth:

```bash
Authorization: Bearer YOUR_SUPABASE_TOKEN
```

**How authentication works:**
1. User authenticates via Supabase (frontend)
2. Supabase returns a JWT token
3. Include token in `Authorization` header for API requests
4. Backend validates token with Supabase
5. User is automatically synced to local database

---

## 📍 Base URL

```
http://localhost:3000/api/v2
```

---

## 🌿 Plant Identification

### `POST /api/v2/plant-id/identify`

Identify plant species from an image using Google Gemini Vision AI.

**Authentication:** Required ✅

**Request Body:**
```json
{
  "imageUrl": "https://example.com/my-plant.jpg",
  "maxSuggestions": 5,
  "organs": ["flower", "leaf"],
  "location": {
    "latitude": 46.5196535,
    "longitude": 6.6322734,
    "country": "Switzerland"
  }
}
```

**OR with Base64:**
```json
{
  "imageBase64": "iVBORw0KGgoAAAANS...",
  "mimeType": "image/jpeg",
  "maxSuggestions": 3
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "confidence": 0.95,
        "commonName": "Monstera",
        "scientificName": "Monstera deliciosa",
        "family": "Araceae",
        "genus": "Monstera",
        "description": "A species of flowering plant...",
        "origin": "Central America",
        "imageUrl": "https://..."
      }
    ],
    "processingTimeMs": 1234,
    "modelUsed": "gemini-3-flash-preview"
  }
}
```

---

### `GET /api/v2/plant-id/status`

Check if the AI identification service is available.

**Authentication:** Required ✅

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "available": true,
    "model": "gemini-3-flash-preview"
  }
}
```

---

## 🩺 Dr. Plant (Disease Diagnosis)

### `POST /api/v2/dr-plant/diagnose`

Diagnose plant health issues from an image.

**Authentication:** Required ✅  
**Content-Type:** `multipart/form-data`  
**Max payload:** 10MB

**Request (multipart/form-data):**
```
image: [File] (required)
symptoms: "Leaves turning yellow" (optional)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "isHealthy": false,
    "confidence": 0.89,
    "conditionName": "Leaf Septoria",
    "conditionType": "DISEASE",
    "severity": "MODERATE",
    "affectedParts": ["leaves"],
    "causes": ["Fungus (Septoria lycopersici)", "High humidity"],
    "symptoms": ["Yellow spots on leaves", "Brown lesions"],
    "treatmentSteps": [
      "Remove infected leaves immediately",
      "Apply copper-based fungicide",
      "Improve air circulation"
    ],
    "preventionTips": [
      "Avoid overhead watering",
      "Space plants properly"
    ],
    "organicTreatment": "Neem oil spray every 7-10 days",
    "chemicalTreatment": "Copper fungicide (follow label instructions)",
    "recoveryTimeWeeks": 2,
    "criticalActions": ["Isolate plant to prevent spread"],
    "processingMs": 2456,
    "aiModel": "gemini-3-flash-preview"
  }
}
```

---

## 🏡 Garden Management

### `GET /api/v2/gardens/plants`

Get all plants belonging to the authenticated user.

**Authentication:** Required ✅

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "plants": [
      {
        "id": "plant-123",
        "nickname": "My Monstera",
        "commonName": "Monstera",
        "scientificName": "Monstera deliciosa",
        "gardenId": "garden-456"
      }
    ]
  }
}
```

---

### `GET /api/v2/gardens/nearby`

Find gardens within a specified radius.

**Authentication:** Required ✅

**Query Parameters:**
- `latitude` (required): Latitude coordinate
- `longitude` (required): Longitude coordinate
- `radiusKm` (optional, default: 10): Search radius in kilometers

**Example:**
```
GET /api/v2/gardens/nearby?latitude=46.5196&longitude=6.6323&radiusKm=5
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "gardens": [
      {
        "id": "garden-789",
        "name": "Urban Greenhouse",
        "latitude": 46.52,
        "longitude": 6.63,
        "distanceKm": 1.2
      }
    ]
  }
}
```

---

### `GET /api/v2/gardens/:gardenId/weather`

Get current weather data for a garden's location.

**Authentication:** Required ✅

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "gardenName": "My Garden",
    "temperature": 22.5,
    "humidity": 65,
    "weatherCode": 0,
    "isRaining": false,
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

---

### `POST /api/v2/gardens/:gardenId/plants`

Add a new plant to a garden.

**Authentication:** Required ✅

**Request Body:**
```json
{
  "nickname": "My Tomato Plant",
  "commonName": "Tomato",
  "scientificName": "Solanum lycopersicum",
  "plantedDate": "2024-01-01"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "plant": {
      "id": "plant-new",
      "nickname": "My Tomato Plant",
      "gardenId": "garden-123"
    }
  }
}
```

---

## 👤 User Profiles

### `GET /api/v2/users/:userId`

Get a user's public profile (excludes sensitive data).

**Authentication:** Required ✅

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

---

## ⚡ WebSocket API

Connect to `ws://localhost:3000` for real-time updates.

### Weather Channel

**Subscribe:**
```json
{
  "type": "SUBSCRIBE",
  "channel": "weather",
  "payload": {
    "gardenId": "garden-123",
    "latitude": 46.5196535,
    "longitude": 6.6322734
  }
}
```

**Server Response:**
```json
{
  "type": "SUBSCRIBED",
  "channel": "weather",
  "payload": { "gardenId": "garden-123" }
}
```

**Weather Update:**
```json
{
  "type": "WEATHER_UPDATE",
  "channel": "weather",
  "payload": {
    "temperature": 22.5,
    "humidity": 65,
    "weatherCode": 0
  }
}
```

### Care Reminders Channel

**Subscribe:**
```json
{
  "type": "SUBSCRIBE",
  "channel": "care-reminders",
  "payload": {
    "userId": "user-123"
  }
}
```

**Reminder:**
```json
{
  "type": "REMINDER",
  "channel": "care-reminders",
  "payload": {
    "reminders": [
      {
        "id": "reminder-1",
        "plantName": "Monstera",
        "action": "water",
        "dueAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

## ❌ Error Responses

All errors follow a consistent format:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": [
    {
      "field": "imageUrl",
      "message": "Required field"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Garden not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred"
}
```

---

## 📊 Rate Limiting

- **Window:** 1 minute
- **Limit:** 100 requests per IP
- **Headers:** Standard draft-6 rate limit headers included

When rate limit is exceeded, you'll receive a `429 Too Many Requests` response.

---

**For interactive exploration, visit `/ui` (Swagger UI)**
