# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GOV.UK Prototype Kit application for RPA (Rural Payments Agency) land parcel mapping improvements. The prototype explores two main user journeys:

1. **Register Land** - Allows users to register land parcels by entering or estimating parcel IDs, with validation against RPA land parcel data
2. **Download Maps** - Enables users to view and download maps of their land parcels with various overlay options

## Commands

### Development
```bash
npm run dev       # Start development server with hot reload
npm run serve     # Start server without auto-reload
npm start         # Production start
```

The prototype runs on `http://localhost:3000` by default.

### Note on Testing
This is a prototype kit project - there are no formal tests. Validation is done through manual testing in the browser.

## Architecture

### Route Versioning Pattern

The application uses a versioned route structure where each prototype iteration is kept separate:

- `app/routes.js` - Main router that delegates to version-specific route modules
- `app/views/register-land-v1/_routes.js` - Version 1 routes
- `app/views/register-land-v2/_routes.js` - Version 2 routes
- `app/views/register-land-v3/_routes.js` - Version 3 routes (latest)
- `app/views/download-maps-v5/_routes.js` - Version 5 routes (latest)

Each version maintains its own routes and views. The latest versions are:
- Register Land: v3 (most feature-complete with parcel validation, land covers, hedgerows)
- Download Maps: v5 (latest iteration)

### Session Data Management

Session data is stored in `req.session.data` and persists across requests. Key session variables:

- `req.session.data['parcel-id']` - Current parcel being processed
- `req.session.data['parcels']` - Array of registered parcels
- `req.session.data['parcel-bounds']` - Geographic bounds for map centering
- `req.session.data['knowParcelID']` - Whether user knows their parcel ID

**Important**: The register-land-v3 flow uses a POST-redirect-GET pattern for form validation:
1. POST handler validates and stores errors in session
2. Redirects to GET route
3. GET route reads errors from session and clears them
4. This prevents form resubmission on browser refresh

### External API Integration

The application integrates with multiple external services via proxy endpoints in `app/routes.js`:

**Map Proxies** (server-side API key injection):
- `/api/map-proxy` - Proxies OS Vector Tile API requests, adds OS_API_KEY from environment
- `/api/geocode-proxy` - Proxies OS Names API (find) for location search
- `/api/reverse-geocode-proxy` - Proxies OS Names API (nearest) for reverse geocoding

**RPA Data Services** (configured in `.env`):
- `PARCEL_SERVICE_URL` - Fetch parcel data by ID
- `PARCEL_BY_COORD_SERVICE_URL` - Find parcel by coordinates
- `WFS_SERVICE_URL` - WFS to GeoJSON conversion service
- `PARCEL_TILE_SERVICE_URL` - Vector tiles for parcel boundaries

**WFS Data Endpoints** (public):
- `WFS_DATA_URL` - RPA Land Parcels WFS service
- `WFS_HEDGE_CONTROL_URL` - RPA Hedge Control data
- `WFS_LAND_COVERS_URL` - RPA Land Covers data

### Map Component Integration

The application uses `@defra/interactive-map` component (configured in `app/config.json`). Maps are rendered in view templates and support:

- OS Vector Tile API styles (Outdoor, Dark, B&W) loaded from `.env` URLs
- Satellite imagery from ArcGIS (configured in `/satellite-style.json` route)
- Interactive parcel selection and drawing
- MapLibre GL geocoder integration

**Repository:** https://github.com/DEFRA/interactive-map

**See [DEFRA-MAP-COMPONENT.md](DEFRA-MAP-COMPONENT.md) for comprehensive documentation** on the DEFRA map component including all plugins, providers, configuration options, and usage examples.

### Form Validation Pattern

The register-land-v3 routes implement comprehensive server-side validation:

1. **Radio selection validation** - Ensures user selects an option before proceeding
2. **Input validation** - Checks required fields are not empty
3. **Format validation** - Validates parcel ID format using regex `/^[A-Z]{2}\s?\d{4}\s?\d{4}$/i`
4. **Existence validation** - Checks parcel ID exists in RPA database via API call
5. **Error handling** - Stores error objects with `.text` property in session, cleared after display

Example error object structure:
```javascript
req.session.data['know-parcel-id-radio-error'] = { text: 'Select Yes if you know the Parcel Id' }
```

### Data Fetching Pattern

The confirm-land-parcel route demonstrates the pattern for fetching related data:

1. Fetch primary parcel data from PARCEL_SERVICE_URL
2. Extract identifiers (SBI, sheet ID, field ref) from parcel properties
3. Fetch related data (land covers, hedgerows) from WFS endpoints using CQL filters
4. Filter results to match specific parcel using SHEET_ID and PARCEL_ID
5. Aggregate data (e.g., total hedgerow length calculation)
6. Pass all data to template for rendering

### Environment Variables

Required environment variables in `.env`:

**Map Services**:
- `OS_API_KEY` - Ordnance Survey API key (injected server-side in proxies)
- `VTS_OUTDOOR_URL`, `VTS_DARK_URL`, `VTS_BLACK_AND_WHITE_URL` - OS Vector Tile style URLs
- `VTS_SATELLITE_URL` - Satellite imagery endpoint (local route)

**Geocoding**:
- `OS_NAMES_URL` - OS Names API find endpoint with query parameters
- `OS_NEAREST_URL` - OS Names API nearest endpoint

**RPA Data**:
- `WFS_SERVICE_URL` - WFS to GeoJSON conversion service
- `PARCEL_SERVICE_URL` - Parcel lookup by ID
- `PARCEL_BY_COORD_SERVICE_URL` - Parcel lookup by coordinates
- `PARCEL_TILE_SERVICE_URL` - Vector tile service for parcels
- `WFS_DATA_URL`, `WFS_HEDGE_CONTROL_URL`, `WFS_LAND_COVERS_URL` - WFS endpoints

**Note**: The OS_API_KEY is intentionally kept server-side and injected via proxy routes to avoid exposing it in client-side code.

## File Structure

```
app/
├── routes.js              # Main router with proxy endpoints
├── config.json            # Service name and plugin configuration
├── filters.js             # Nunjucks custom filters
├── views/
│   ├── index.html         # Homepage with version accordion
│   ├── layouts/           # Base page templates
│   ├── register-land-v3/  # Latest register land prototype
│   │   ├── _routes.js     # Version-specific routes
│   │   └── *.html         # View templates
│   └── download-maps-v5/  # Latest download maps prototype
│       ├── _routes.js
│       └── *.html
├── assets/
│   ├── images/            # Static images
│   ├── javascripts/       # Client-side JavaScript
│   └── sass/              # Stylesheets
└── data/                  # Mock data files (if any)
```

## Working with Routes

When adding new routes:

1. Add routes to the version-specific `_routes.js` file (e.g., `register-land-v3/_routes.js`)
2. Use the GOV.UK Prototype Kit router: `govukPrototypeKit.requests.setupRouter()`
3. Store form data in `req.session.data` for persistence across requests
4. Follow POST-redirect-GET pattern for form submissions to prevent resubmission
5. For validation errors, store in session, redirect to GET route, then clear from session
6. Export the router at the end: `module.exports = router`

## Working with Maps

When implementing map functionality:

1. Use the `@defra/interactive-map` component (already configured in `config.json`)
2. Access OS tiles via `/api/map-proxy` to keep API key server-side
3. Use environment variables for map style URLs (VTS_OUTDOOR_URL, etc.)
4. For parcel data, use `PARCEL_TILE_SERVICE_URL` for vector tiles
5. Geocoding should go through `/api/geocode-proxy` and `/api/reverse-geocode-proxy`
6. Store map state (bounds, center, zoom) in session data when needed for page transitions

## Prototype Versioning

Each prototype version is kept intact for reference and testing. When creating a new version:

1. Copy the previous version directory (e.g., `register-land-v3` → `register-land-v4`)
2. Create new `_routes.js` in the new version directory
3. Register the new routes in `app/routes.js`
4. Update `app/views/index.html` accordion to include the new version
5. Maintain backward compatibility - old versions should continue to work

The homepage (`/`) displays an accordion showing all prototype versions with changelogs.
