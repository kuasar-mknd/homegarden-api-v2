# API Documentation

The HomeGarden API is fully documented using **OpenAPI 3.0** (Swagger).

## Interactive Documentation

When the server is running locally (default: `http://localhost:3000`), you can access:

-   **Swagger UI**: [http://localhost:3000/ui](http://localhost:3000/ui) - Interactive interface to test endpoints.
-   **OpenAPI Spec**: [http://localhost:3000/doc](http://localhost:3000/doc) - Raw JSON specification.

## Core Resources

The API is organized into versioned resources (`/api/v2/...`).

### 1. Plant Identification (`/api/v2/plant-id`)
-   `POST /identify`: Identify a plant from an image (Base64).
-   `GET /status`: Check service availability.

### 2. Dr. Plant (`/api/v2/dr-plant`)
-   `POST /diagnose`: Diagnose plant health issues from an image (multipart/form-data).

### 3. Gardens (`/api/v2/gardens`)
-   `GET /nearby`: Find gardens near a location.
-   `GET /{gardenId}/weather`: Get weather forecast for a garden.
-   `POST /plants`: Add a plant to a garden.
-   `GET /plants`: Get all plants for the authenticated user.

### 4. Users (`/api/v2/users`)
-   `GET /{id}`: Get public profile.

### 5. Authentication (`/api/v2/auth`)
-   `POST /register`: Register user (Supabase).
-   `POST /login`: Login user (Supabase).
-   *Note: Most authentication is handled directly via Supabase client-side, but these endpoints exist for server-side flows.*

## Authentication

Most endpoints require a Bearer Token from Supabase.

**Header:**
`Authorization: Bearer <YOUR_JWT_TOKEN>`

## Error Format

Errors are returned in a standard JSON format:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message"
}
```
