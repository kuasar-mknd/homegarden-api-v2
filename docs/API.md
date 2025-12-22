# API Reference

The HomeGarden API provides endpoints for plant management, AI identification, weather data, and more.

## Base URL

`http://localhost:3000/api/v2`

## Authentication

Most endpoints require a Bearer Token (Supabase JWT).

```
Authorization: Bearer <your-supabase-jwt>
```

---

## 🌿 Gardens

### Get User's Plants

`GET /gardens/plants`
Retrieves all plants in the authenticated user's garden.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "plant-123",
      "name": "My Tomato",
      "species": "Solanum lycopersicum",
      "healthStatus": "HEALTHY"
    }
  ]
}
```

### Add Plant

`POST /gardens/:id/plants`
Adds a new plant to a specific garden.

**Body:**

```json
{
  "name": "Basil",
  "species": "Ocimum basilicum",
  "imageUrl": "https://..."
}
```

### Get Nearby Gardens

`GET /gardens/nearby`
Finds public gardens within a specific radius (geo-query).

**Query Params:**

- `lat`: Latitude
- `lng`: Longitude
- `radius`: Radius in km (default: 10)

---

## 🔍 AI Identification

### Identify Plant

`POST /plant-id/identify`
Identifies a plant from an image URL.

**Body:**

```json
{
  "imageUrl": "https://example.com/flower.jpg"
}
```

### Diagnose Disease

`POST /dr-plant/diagnose`
Diagnoses plant health issues.

**Body:**

```json
{
  "imageUrl": "https://example.com/sick-plant.jpg",
  "observation": "Leaves are turning yellow"
}
```

---

## 🌤️ Weather

### Get Garden Weather

`GET /gardens/:id/weather`
Fetches current weather for a garden's location.

**Response:**

```json
{
  "temperature": 22.5,
  "humidity": 60,
  "condition": "Sunny"
}
```

---

## 👤 Users

### Get Profile

`GET /users/:id`
Get public profile information for a user.

---

## 📘 Interactive Documentation

For a full interactive list of endpoints, schemas, and to test requests directly:

- **Swagger UI**: Visit `/ui`
- **OpenAPI Spec**: Visit `/doc`
