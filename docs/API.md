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

Authentication is primarily handled directly by the Supabase Client on the frontend.
The following endpoints exist but currently return `501 Not Implemented` as the logic is delegated to Supabase:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh-token`

### Gardens & Plants

- `GET /gardens/plants` - Retrieves all plants for the authenticated user (across all gardens).
- `POST /gardens/plants` - Adds a new plant to a specific garden (requires `gardenId` in body).
- `GET /gardens/nearby` - Finds public gardens within a specific radius (geo-query).
- `GET /gardens/:gardenId/weather` - Fetches current weather for a garden's location.

### Plants (Legacy / Planned)

These endpoints are placeholders and currently return `501 Not Implemented`. Use `/gardens/plants` for plant management.
- `GET /plants`
- `POST /plants`
- `GET /plants/:id`
- `PATCH /plants/:id`
- `DELETE /plants/:id`

### AI Identification

- `GET /plant-id/status` - Check Plant ID service availability.
- `POST /plant-id/identify` - Identifies a plant from an image URL or Base64 data (JSON Body).
- `POST /dr-plant/diagnose` - Diagnoses plant health issues from an image (Multipart/Form-Data).

### Users

- `GET /users/:id` - Get public profile information for a user.

### Care Tracker (Coming Soon)

These endpoints currently return `501 Not Implemented`.

- `GET /care-tracker/upcoming` - Get upcoming tasks.
- `POST /care-tracker/schedules` - Create a care schedule.
- `POST /care-tracker/schedules/:id/complete` - Mark task as complete.
- `POST /care-tracker/generate` - Generate smart schedule.

---

## 📝 Error Format

Errors are returned in a standardized JSON format:

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid input data",
  "details": [
    {
      "code": "invalid_string",
      "path": ["imageUrl"],
      "message": "Invalid URL"
    }
  ]
}
```

## 🔌 WebSocket API

Real-time features are available via WebSocket at `ws://localhost:3000`.

See `README.md` for subscription examples.
