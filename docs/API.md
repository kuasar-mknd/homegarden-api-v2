# API Documentation

The HomeGarden API is fully documented using the OpenAPI 3.0 specification.

## Interactive Documentation

When the server is running, you can access the interactive documentation:

*   **Swagger UI**: [http://localhost:3000/ui](http://localhost:3000/ui)
*   **OpenAPI Spec**: [http://localhost:3000/doc](http://localhost:3000/doc)

The Swagger UI allows you to explore endpoints, see request/response schemas, and execute requests directly against the API.

## API Features & Status

| Feature | Base Path | Status | Description |
|---|---|---|---|
| **Plant ID** | `/api/v2/plant-id` | ✅ Implemented | Identify plants using AI. |
| **Dr. Plant** | `/api/v2/dr-plant` | ✅ Implemented | Diagnose plant diseases. |
| **Gardens** | `/api/v2/gardens` | ✅ Implemented | Manage gardens, find nearby, weather. |
| **Plants** | `/api/v2/gardens/plants` | ✅ Implemented | Add plants, list user plants. |
| **Users** | `/api/v2/users` | ✅ Implemented | User profile. |
| **Auth** | `/api/v2/auth` | 🚧 Supabase | Backend endpoints return 501 (Auth is client-side). |
| **Plant CRUD** | `/api/v2/plants` | 🚧 Planned | Full CRUD for individual plants (Update/Delete). |
| **Care Tracker**| `/api/v2/care-tracker`| 🚧 Planned | Tracking watering and tasks. |

## Authentication

The API uses **Supabase Auth**.

1.  **Register/Login** on the frontend (or using the Supabase client directly).
2.  Obtain the **Access Token** (JWT).
3.  Include the token in the `Authorization` header for protected endpoints:

```http
Authorization: Bearer <YOUR_ACCESS_TOKEN>
```

## Error Handling

Errors follow a consistent JSON format:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable description"
}
```

Common HTTP status codes:
*   `200 OK`: Success
*   `201 Created`: Resource created
*   `400 Bad Request`: Validation failure
*   `401 Unauthorized`: Missing or invalid token
*   `404 Not Found`: Resource not found
*   `500 Internal Server Error`: Server-side issue
*   `501 Not Implemented`: Feature coming soon
