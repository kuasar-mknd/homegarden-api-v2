# Bolt's Journal (Critical Learnings)

## Optimization Patterns

### Spatial Query Optimization
**Problem:** `findNearby` queries using the Haversine formula on the entire table scale poorly (O(N)).
**Solution:** Implemented Bounding Box pre-filtering.
**Details:**
- Calculated `minLat`, `maxLat`, `minLng`, `maxLng` based on the search radius.
- Added `WHERE latitude BETWEEN ... AND longitude BETWEEN ...` clauses.
- This leverages the database index on `[latitude, longitude]` to drastically reduce the number of rows processed by the expensive trigonometric functions.
