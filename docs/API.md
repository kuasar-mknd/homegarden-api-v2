# API Reference

The HomeGarden API provides endpoints for plant management, AI identification, weather data, and more.

## Base URL

`http://localhost:3000/api/v2`

## Authentication

Most endpoints require a Bearer Token (Supabase JWT).

```http
Authorization: Bearer <your-supabase-jwt>
```

## Rate Limiting

The API implements rate limiting to prevent abuse.

- **Limit**: 350 requests per 15 minutes (configurable).
- **Headers**:
  - `X-RateLimit-Limit`: The maximum number of requests allowed in the window.
  - `X-RateLimit-Remaining`: The number of requests remaining in the current window.
  - `X-RateLimit-Reset`: The time at which the current window resets (in UTC epoch seconds).

---

## 📘 Interactive Documentation (Swagger UI)

The best way to explore the API is via the built-in Swagger UI, which provides interactive documentation, schema definitions, and "Try it out" functionality.

- **Swagger UI**: Visit `/ui` (e.g., `http://localhost:3000/ui`)
- **OpenAPI Spec**: Visit `/doc` (e.g., `http://localhost:3000/doc`)

---

## 🌿 Core Resources

### Gardens

- `GET /gardens/plants` - Retrieves all plants in the authenticated user's garden.
- `POST /gardens/plants` - Adds a new plant to a specific garden (requires `gardenId` in body).
- `GET /gardens/nearby` - Finds public gardens within a specific radius (geo-query).
- `GET /gardens/:gardenId/weather` - Fetches current weather for a garden's location.

### AI Identification

- `POST /plant-id/identify` - Identifies a plant from an image URL.
- `POST /dr-plant/diagnose` - Diagnoses plant health issues from an image.

### Users

- `GET /users/me` - Get current user profile.
- `PUT /users/me` - Update user profile (display name, preferences).
- `GET /users/:id` - Get public profile information for a user.

### Care Tracker

- `GET /plants/:plantId/schedules` - Get care schedules for a plant.
- `POST /plants/:plantId/schedules` - Create a care schedule.
- `POST /schedules/:id/logs` - Log a care activity (mark as completed).

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
