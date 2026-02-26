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

### Auth

*Endpoints are placeholders. Authentication is primarily handled via Supabase Client SDK.*

- `POST /auth/register` (501 Not Implemented)
- `POST /auth/login` (501 Not Implemented)

### Gardens

The primary way to manage plants is through the Garden endpoints.

- `GET /gardens/plants`
  - **Description**: Retrieves all plants for the authenticated user across all their gardens.
  - **Status**: Implemented.
- `POST /gardens/plants`
  - **Description**: Adds a new plant to a specific garden.
  - **Status**: Implemented.
  - **Body**: `{ "gardenId": "uuid", "name": "Rose", "species": "Rosa", "imageUrl": "..." }`
- `GET /gardens/nearby`
  - **Description**: Finds public gardens within a specific radius.
  - **Query**: `?lat=...&lng=...&radius=...`
  - **Status**: Implemented.
- `GET /gardens/:gardenId/weather`
  - **Description**: Fetches current weather for a garden's location.
  - **Status**: Implemented.

### Plants

*Global plant management endpoints are currently under development. Use `/gardens/plants` for listing plants.*

- `GET /plants` (501 Not Implemented)
- `POST /plants` (501 Not Implemented)
- `GET /plants/:id` (501 Not Implemented)
- `PATCH /plants/:id` (501 Not Implemented)
- `DELETE /plants/:id` (501 Not Implemented)

### AI Identification

- `GET /plant-id/status`
  - **Description**: Check service availability.
- `POST /plant-id/identify`
  - **Description**: Identifies a plant from an image.
  - **Body**: `{ "imageUrl": "..." }` or `{ "imageBase64": "..." }`
- `POST /dr-plant/diagnose`
  - **Description**: Diagnoses plant health issues.
  - **Body**: `{ "imageUrl": "..." }` or `{ "imageBase64": "..." }`

### Users

- `GET /users/:id`
  - **Description**: Get public profile information for a user.

### Care Tracker (Coming Soon)

*These endpoints currently return `501 Not Implemented`.*

- `GET /care-tracker/upcoming`
- `POST /care-tracker/schedules`
- `POST /care-tracker/schedules/:id/complete`
- `POST /care-tracker/generate`

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
