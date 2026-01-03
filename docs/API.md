# API Documentation

The HomeGarden API is fully documented using OpenAPI (Swagger).

## 📄 Interactive Documentation

When the server is running locally, you can access the interactive Swagger UI at:

**[http://localhost:3000/ui](http://localhost:3000/ui)**

The raw OpenAPI specification is available at:

**[http://localhost:3000/doc](http://localhost:3000/doc)**

## 🚀 Main Endpoints

All API endpoints are prefixed with `/api/v2`.

| Resource | Path | Description |
|---|---|---|
| **Auth** | `/api/v2/auth` | Authentication (Login, Register, Refresh Token) |
| **Users** | `/api/v2/users` | User profile management |
| **Gardens** | `/api/v2/gardens` | Manage gardens and find nearby gardens |
| **Plants** | `/api/v2/plants` | Manage plants within gardens |
| **Plant ID** | `/api/v2/plant-id` | AI-powered plant identification |
| **Dr. Plant** | `/api/v2/dr-plant` | AI-powered plant disease diagnosis |
| **Care Tracker** | `/api/v2/care-tracker` | Track plant care tasks (watering, fertilizing) |

## 🔐 Authentication

Most endpoints require authentication. The API uses Bearer tokens (JWT) provided by Supabase.

**Header:**
```
Authorization: Bearer <your-jwt-token>
```

## ⚠️ Error Handling

Errors are returned in a standard JSON format:

```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Human readable error message"
}
```

Common error codes:
*   `400 Bad Request`: Invalid input (validation failed).
*   `401 Unauthorized`: Missing or invalid token.
*   `403 Forbidden`: Insufficient permissions.
*   `404 Not Found`: Resource not found.
*   `429 Too Many Requests`: Rate limit exceeded.
*   `500 Internal Server Error`: Unexpected server error.
