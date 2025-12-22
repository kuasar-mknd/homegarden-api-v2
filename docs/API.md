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

### Gardens

- `GET /gardens/plants` - Retrieves all plants in the authenticated user's garden.
- `POST /gardens/:id/plants` - Adds a new plant to a specific garden.
- `GET /gardens/nearby` - Finds public gardens within a specific radius (geo-query).
- `GET /gardens/:id/weather` - Fetches current weather for a garden's location.

### AI Identification

- `POST /plant-id/identify` - Identifies a plant from an image URL.
- `POST /dr-plant/diagnose` - Diagnoses plant health issues from an image.

### Users

- `GET /users/:id` - Get public profile information for a user.

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
