# Bolt's Journal (Critical Learnings)

## Optimization Patterns

### Spatial Query Optimization

**Problem:** `findNearby` queries using the Haversine formula on the entire table scale poorly (O(N)).

**Solution:** Implemented Bounding Box pre-filtering.

**Details:**

- Calculated `minLat`, `maxLat`, `minLng`, `maxLng` based on the search radius.
- Added `WHERE latitude BETWEEN ... AND longitude BETWEEN ...` clauses.
- This leverages the database index on `[latitude, longitude]` to drastically reduce the number of rows processed by the expensive trigonometric functions.

## 2024-05-22 - [Cache Key Granularity]
**Learning:** High precision floating point numbers in cache keys cause excessive cache misses.
**Action:** When caching geospatial data (like weather), round coordinates to a reasonable precision (e.g., 2 decimal places ~= 1.1km) to group nearby requests and increase cache hit rates.

## 2024-05-22 - [Static Response Caching]
**Learning:** Re-generating static HTML strings on every request adds unnecessary overhead.
**Action:** Lift static content generation out of the request handler scope into module scope (or use a memoized function) to generate it once at startup.

## 2024-05-23 - [Partial Entity Selection]
**Learning:** Optimizing SQL queries by excluding fields (like `description`) broke the Domain Entity contract, as the entity factory expected these fields or required them to be explicitly handled.
**Action:** Only optimize field selection if the Repository method explicitly returns a DTO (e.g., `GardenSummary`) or if the Entity is designed to handle partial hydration safely.

## 2024-05-23 - [Static Layout Anti-Pattern]
**Learning:** Pre-computing HTML layouts (header/footer) to save string concatenation is a micro-optimization that creates security risks (e.g., static CSP nonces) and prevents dynamic content (Auth state).
**Action:** Avoid caching layout templates unless they are strictly static and have no dependencies on request context.

## 2024-05-24 - [Auth Middleware Cache Trap]
**Learning:** Attempting to cache the entire database `User` object within the authentication middleware using a simple in-memory Map is a critical anti-pattern. Not only does it create an O(N) blocking iteration during cache eviction, but it also causes severe downstream bugs by serving stale data (e.g., permissions, profile updates) for the duration of the TTL.
**Action:** Do not implement local stateful caching for rapidly changing or security-critical entity data (like `User`) in middleware. Instead, optimize the database fetch itself.

## 2024-05-24 - [Edge-Compatible Timing]
**Learning:** While `node:perf_hooks` provides `performance`, importing it in Hono middleware (`logger.middleware.ts`) can break compatibility with Edge environments (like Cloudflare Workers).
**Action:** Use the globally available `performance.now()` API without imports to measure request durations safely across all deployment targets.