## 2024-05-23 - Controller Input Validation Bypass
**Vulnerability:** The `GardenController` was bypassing Zod validation by using `c.req.json()` instead of `c.req.valid('json')`, allowing unvalidated fields (like `location` and `speciesInfo`) to be processed.
**Learning:** Hono's `zod-openapi` middleware validates the request, but developers must explicitly access the validated data. Using the raw body reader defeats the purpose of the middleware if the schema is not strict or if fields are missing from the schema.
**Prevention:** Always use `c.req.valid('json')` in controllers. Ensure schemas include all fields that the controller logic consumes.
