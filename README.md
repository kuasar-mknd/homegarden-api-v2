# HomeGarden API

HomeGarden is a robust, Clean Architecture-based REST API for managing gardens and plants, powered by AI for identification and diagnosis. It uses Hono, Prisma, and Supabase to provide a scalable and type-safe backend.

## 🌟 Features

*   **Clean Architecture**: Separation of concerns into Domain, Application, and Infrastructure layers.
*   **Plant Management**: CRUD operations for Gardens and Plants.
*   **AI Integration**:
    *   **Identification**: Identify plants from images using Google Gemini Vision (`gemini-2.0-flash`).
    *   **Diagnosis**: Diagnose plant health issues using Google Gemini Vision (`gemini-2.5-pro-preview-06-05`).
*   **Weather Integration**: Fetch weather data for garden locations via Open-Meteo.
*   **Authentication**: Secure authentication using Supabase Auth (JWT).
*   **Type Safety**: End-to-end type safety with TypeScript, Zod, and Prisma.
*   **Interactive Docs**: OpenAPI (Swagger) documentation available at `/ui`.

## 🛠️ Local Setup

### Prerequisites

*   Node.js >= 20.0.0
*   pnpm (managed via `corepack` or installed globally)
*   Docker (for local Postgres database)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repo-url>
    cd homegarden-api
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Environment Setup:**
    Copy `.env.example` to `.env` and fill in the required values.
    ```bash
    cp .env.example .env
    ```
    *   **Important**: You need a Supabase project for `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.
    *   For AI features, get a key from [Google AI Studio](https://aistudio.google.com/).

4.  **Database Setup:**
    Start a Postgres database (e.g., via Docker) and set `DATABASE_URL` in `.env`.
    ```bash
    # Recommended: Use docker-compose
    docker-compose up -d
    ```

    Or manually:
    ```bash
    docker run --name homegarden-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=homegarden -p 5432:5432 -d postgis/postgis:15-3.3
    ```

    Push the schema to the database:
    ```bash
    pnpm db:push
    ```
    (Optional) Seed the database:
    ```bash
    pnpm db:seed
    ```

5.  **Run the Server:**
    ```bash
    pnpm dev
    ```
    The server will start on `http://localhost:3000`.

## 🧪 Testing

For detailed testing instructions, see [docs/TESTING.md](docs/TESTING.md).

Run unit and integration tests:
```bash
pnpm test
```

Run tests with coverage:
```bash
pnpm test:coverage
```

## 📖 API Usage

The API is documented using Swagger. Once the server is running, visit:
*   **Swagger UI**: [http://localhost:3000/ui](http://localhost:3000/ui)
*   **OpenAPI Spec**: [http://localhost:3000/doc](http://localhost:3000/doc)

### Example: Check API Status
```bash
curl http://localhost:3000/api/v2
```

### Example: Identify a Plant (requires Auth)

You can send either an `imageUrl` or `imageBase64`.

```bash
curl -X POST http://localhost:3000/api/v2/plant-id/identify \
  -H "Authorization: Bearer <YOUR_SUPABASE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Monstera_deliciosa5.jpg/640px-Monstera_deliciosa5.jpg"}'
```

### Example: Diagnose a Plant (Dr. Plant)

This endpoint uses `multipart/form-data` to upload an image file.

```bash
curl -X POST http://localhost:3000/api/v2/dr-plant/diagnose \
  -H "Authorization: Bearer <YOUR_SUPABASE_TOKEN>" \
  -F "image=@/path/to/sick_plant.jpg" \
  -F "symptoms=Yellowing leaves with spots"
```

## 🔌 WebSocket Usage

Real-time features like weather updates are available via WebSocket.

**Connect**: `ws://localhost:3000`

**Example: Get Weather**
```json
{
  "channel": "weather",
  "type": "GET_WEATHER",
  "payload": {
    "latitude": 40.71,
    "longitude": -74.01
  }
}
```

## 🔧 Troubleshooting

*   **`Supabase URL or Publishable Key not configured`**: Ensure `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are set in `.env`.
*   **Database Connection Errors**: Check if your Postgres container is running and accessible. Verify `DATABASE_URL` matches your container settings.
    *   Check logs: `docker-compose logs db` or `docker logs homegarden-db`
*   **AI Errors**: Verify `GOOGLE_AI_API_KEY` is valid and has access to the specified models.
*   **Module not found errors**: If you see errors about `@prisma/client`, run `pnpm db:generate` manually.
*   **Port in Use**: If port 3000 is occupied, change `PORT` in `.env`.
*   **Rate Limit Exceeded**: If you receive `429 Too Many Requests`, wait a few minutes before trying again. The default limit is 350 requests per 15 minutes.
