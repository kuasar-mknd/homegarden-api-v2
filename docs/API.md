# API Reference

The HomeGarden API provides endpoints for plant management, AI identification, weather data, and more.

## Base URL

`http://localhost:3000/api/v2`

## Authentication

Most endpoints require a Bearer Token (Supabase JWT).

```http
Authorization: Bearer <your-supabase-jwt>
```

---

## 📘 Interactive Documentation (Swagger UI)

The best way to explore the API is via the built-in Swagger UI, which provides interactive documentation, schema definitions, and "Try it out" functionality.

- **Swagger UI**: Visit `/ui` (e.g., `http://localhost:3000/ui`)
- **OpenAPI Spec**: Visit `/doc` (e.g., `http://localhost:3000/doc`)

---

## 🌿 Core Resources

### Base & Info Routes

- `GET /api/v2` - API version info and root endpoints overview.
- `GET /ui` - Swagger UI.
- `GET /doc` - OpenAPI JSON Spec.

### Auth

*Endpoints are currently placeholders (501 Not Implemented). Client-side authentication via Supabase SDK is recommended.*

- `POST /api/v2/auth/register` - Register a new user (501 Not Implemented).
- `POST /api/v2/auth/login` - Authenticate user (501 Not Implemented).

### Gardens

- **`GET /api/v2/gardens/plants`** - Retrieves all plants in the authenticated user's garden.
  *Response Example:*
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "plant-123",
        "gardenId": "garden-456",
        "name": "Ficus",
        "species": "Ficus elastica"
      }
    ]
  }
  ```

- **`POST /api/v2/gardens/plants`** - Adds a new plant to a specific garden.
  *Request Example:*
  ```json
  {
    "gardenId": "garden-456",
    "name": "My Ficus",
    "species": "Ficus elastica",
    "notes": "Loves bright indirect light"
  }
  ```
  *Response Example:*
  ```json
  {
    "success": true,
    "data": { "id": "plant-123", "name": "My Ficus" }
  }
  ```

- **`GET /api/v2/gardens/nearby`** - Finds public gardens within a specific radius.
  *Request Example:* `/api/v2/gardens/nearby?lat=40.7128&lng=-74.0060&radius=5`
  *Response Example:*
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "garden-456",
        "name": "Community Garden",
        "distance": 2.5
      }
    ]
  }
  ```

- **`GET /api/v2/gardens/{gardenId}/weather`** - Fetches current weather for a garden's location.
  *Response Example:*
  ```json
  {
    "success": true,
    "data": {
      "temperature": 22.5,
      "humidity": 60,
      "conditions": "Partly Cloudy"
    }
  }
  ```

### Plants

*Direct plant management endpoints are partially implemented; use Garden endpoints for main flows.*

- `GET /api/v2/plants` - List all plants for the user (501 Not Implemented).
- `POST /api/v2/plants` - Create a new plant (501 Not Implemented).
- `GET /api/v2/plants/{id}` - Get plant details (501 Not Implemented).
- `PATCH /api/v2/plants/{id}` - Update plant details (501 Not Implemented).

### AI Services

- **`GET /api/v2/plant-id/status`** - Check Plant ID service availability.
  *Response Example:*
  ```json
  {
    "success": true,
    "status": "online"
  }
  ```

- **`POST /api/v2/plant-id/identify`** - Identifies a plant from an image URL or Base64 data (JSON Body).
  *Request Example:*
  ```json
  {
    "imageUrl": "https://example.com/monstera.jpg"
  }
  ```
  *Response Example:*
  ```json
  {
    "success": true,
    "data": {
      "suggestions": [
        {
          "commonName": "Monstera",
          "scientificName": "Monstera deliciosa",
          "confidence": 0.95
        }
      ]
    }
  }
  ```

- **`POST /api/v2/dr-plant/diagnose`** - Diagnoses plant health issues from an image (Multipart/Form-Data).
  *Request Example:* `form-data` with `image` file and `plantId` (optional).
  *Response Example:*
  ```json
  {
    "success": true,
    "data": {
      "isHealthy": false,
      "condition": {
        "name": "Powdery Mildew",
        "type": "DISEASE",
        "severity": "MODERATE"
      },
      "treatments": [
        {
          "action": "Apply fungicide",
          "instructions": "Spray leaves thoroughly"
        }
      ]
    }
  }
  ```

### Users

- `GET /api/v2/users/{id}` - Get public profile information for a user.

### Care Tracker (Coming Soon)

*These endpoints currently return `501 Not Implemented`.*

- `GET /api/v2/care-tracker/upcoming` - Get upcoming tasks (501 Not Implemented).
- `POST /api/v2/care-tracker/schedules` - Create a care schedule (501 Not Implemented).
- `POST /api/v2/care-tracker/schedules/{id}/complete` - Mark task as complete (501 Not Implemented).

---

## 📝 Error Format

Errors are returned in a standardized JSON format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "imageUrl",
        "message": "Invalid URL format"
      }
    ]
  }
}
```

## 🔌 WebSocket API

Real-time features are available via WebSocket at `ws://localhost:3000`.

See `README.md` for subscription examples.
