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

## 2024-05-23 - [Application-Side Join for One-to-Many]
**Learning:** Nested `where` clauses in Prisma (e.g., `where: { garden: { userId } }`) can trigger expensive database JOINs that might be less efficient than two simple indexed queries for specific relationship patterns.
**Action:** For one-to-many relationships where the parent set is small (e.g., User -> Gardens), fetch parent IDs first and use an `IN` clause for the child query (`where: { gardenId: { in: ids } }`). This leverages simple B-Tree indexes and avoids complex join planning overhead.
