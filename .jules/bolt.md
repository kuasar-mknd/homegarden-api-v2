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

## 2024-05-24 - [Repository Partial Select Safety]
**Learning:** Optimizing Repository fetch methods (like `findById`) with `select` is safe ONLY if the Domain Entity Mapper does not rely on the excluded fields.
**Action:** Verified that `UserPrismaRepository` maps to `User` entity which strictly excludes `password` and `preferences`, making the `select` optimization safe and effective.

## 2024-05-24 - [Public Search Caching]
**Learning:** Geospatial search endpoints (`getNearby`) are prime candidates for `Cache-Control` headers when the results are location-based and not user-specific.
**Action:** Added `Cache-Control: public, max-age=300` to `GardenController.getNearby` to offload expensive PostGIS queries.
