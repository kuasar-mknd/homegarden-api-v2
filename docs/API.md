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

## ✅ Implemented Endpoints

### 🏡 Gardens & My Plants

Manage your personal garden and find public gardens.

- `GET /gardens/plants`
  - **Description**: Retrieve all plants in the authenticated user's garden.
- `POST /gardens/plants`
  - **Description**: Add a new plant to your garden.
  - **Body**: `{ "nickname": "Spikey", "species": "Cactus", ... }`
- `GET /gardens/nearby`
  - **Description**: Find public gardens within a specific radius (geo-query).
  - **Query**: `lat`, `lng`, `radius`
- `GET /gardens/:gardenId/weather`
  - **Description**: Fetches current weather and forecast for a garden's location.

### 🤖 AI Services

- `POST /plant-id/identify`
  - **Description**: Identifies a plant from an image URL or Base64 data.
  - **Body**: `{ "imageUrl": "..." }` or `{ "imageBase64": "..." }`
- `GET /plant-id/status`
  - **Description**: Check Plant ID service availability.
- `POST /dr-plant/diagnose`
  - **Description**: Diagnoses plant health issues from an image.
  - **Format**: Multipart/Form-Data (file upload).

### 👤 Users

- `GET /users/:id`
  - **Description**: Get public profile information for a user.

---

## 🚧 Not Implemented / Coming Soon

The following endpoints are defined but currently return `501 Not Implemented`.

### Auth (Native)
*Use Supabase Client SDKs for authentication.*
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh-token`

### Plants (Root Resource)
*Use `/gardens/plants` for managing your plants.*
- `GET /plants`
- `POST /plants`
- `GET /plants/:id`
- `PATCH /plants/:id`
- `DELETE /plants/:id`

### Care Tracker
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
