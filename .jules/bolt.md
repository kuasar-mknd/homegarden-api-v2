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
