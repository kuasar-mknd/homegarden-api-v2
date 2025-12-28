# API Reference

The HomeGarden API is a RESTful service documented using **OpenAPI (Swagger)**.

## 📖 Interactive Documentation

When running locally, verify the full API specification and test endpoints directly in your browser:

👉 **[http://localhost:3000/ui](http://localhost:3000/ui)**

## 🔑 Authentication

Most endpoints require authentication via a Bearer Token (JWT) provided by Supabase.

*   **Header**: `Authorization: Bearer <token>`

## 🛣️ Core Resources

### 🌿 Garden (`/api/garden`)
Manage your gardens.
*   `GET /api/garden`: List all gardens.
*   `POST /api/garden`: Create a new garden.
*   `GET /api/garden/:id`: Get details.
*   `GET /api/garden/location/:latitude/:longitude`: Find gardens near coordinates.

### 🌻 Plant (`/api/plant`)
Manage plants within your gardens.
*   `POST /api/plant`: Add a plant to a garden.
*   `GET /api/plant`: List plants (filterable by garden).

### 🔍 Plant ID (`/api/plant/identify`)
*   `POST /api/plant/identify`: Upload an image to identify the plant species.
    *   **Input**: `multipart/form-data` with `image` file.
    *   **Output**: List of potential matches with confidence scores.

### 🩺 Dr. Plant (`/api/dr-plant`)
*   `POST /api/dr-plant/diagnose`: Upload an image of a sick plant.
    *   **Input**: `multipart/form-data` with `image` file.
    *   **Output**: Diagnosis, confidence, and treatment plan.

### 📅 Care Tracker (`/api/care-tracker`)
*   `GET /api/care-tracker/upcoming`: Get a list of pending tasks (water, fertilize).
*   `POST /api/care-tracker/schedules`: Create a new care schedule.

### 👤 User (`/api/user`)
*   `GET /api/user/profile`: Get current user profile.
*   `PATCH /api/user/profile`: Update preferences.

## ⚠️ Error Handling

Errors follow a standard JSON format:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable description"
}
```
