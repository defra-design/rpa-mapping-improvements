# RPA Mapping Improvements Prototype

A GOV.UK Prototype Kit application for exploring improvements to RPA (Rural Payments Agency) land parcel mapping and registration services.

## Overview

This prototype explores two main user journeys:

- **Register Land** - Register land parcels by entering or estimating parcel IDs, with validation against RPA land parcel data
- **Download Maps** - View and download maps of land parcels with various overlay options (land covers, hedgerows, satellite imagery)

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
cd rpa-mapping-improvements
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Copy the `.env` file if it doesn't exist, or ensure you have the following variables configured:

```bash
# OS Vector Tile API
VTS_OUTDOOR_URL=https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/main/OS_VTS_3857_Outdoor.json
VTS_DARK_URL=https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/main/OS_VTS_3857_Dark.json
VTS_BLACK_AND_WHITE_URL=https://raw.githubusercontent.com/OrdnanceSurvey/OS-Vector-Tile-API-Stylesheets/main/OS_VTS_3857_Black_and_White.json
VTS_SATELLITE_URL=/satellite-style.json

# OS Names API (requires OS API key)
OS_NAMES_URL=https://api.os.uk/search/names/v1/find?query={query}&fq=...
OS_NEAREST_URL=https://api.os.uk/search/names/v1/nearest?point={easting},{northing}&radius=1000&fq=...

# OS API Key (required for mapping features)
OS_API_KEY=your-api-key-here

# RPA Data Services
PARCEL_SERVICE_URL=https://farming-data-7db3d1889632.herokuapp.com/parcel
PARCEL_BY_COORD_SERVICE_URL=https://farming-data-7db3d1889632.herokuapp.com/parcel/by-coord
PARCEL_TILE_SERVICE_URL=https://farming-tiles-702a60f45633.herokuapp.com/field_parcels_filtered/{z}/{x}/{y}
WFS_SERVICE_URL=https://farming-data-7db3d1889632.herokuapp.com/wfs-geojson

# WFS Data Endpoints
WFS_DATA_URL=https://environment.data.gov.uk/data-services/RPA/LandParcels/wfs?version=2.0.0&request=GetFeature&typeNames=RPA:LandParcels
WFS_HEDGE_CONTROL_URL=https://environment.data.gov.uk/data-services/RPA/HedgeControl/wfs?version=2.0.0&request=GetFeature&typeNames=RPA:HedgeControl
WFS_LAND_COVERS_URL=https://environment.data.gov.uk/data-services/RPA/LandCovers/wfs?version=2.0.0&request=GetFeature&typeNames=RPA:LandCovers
```

**Note**: You'll need to obtain an Ordnance Survey API key from [OS Data Hub](https://osdatahub.os.uk/) for full mapping functionality.

## Running the Prototype

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Server Mode (without auto-reload)
```bash
npm run serve
```

### Production Mode
```bash
npm start
```

The prototype will be available at `http://localhost:3000`

## Project Structure

```
├── app/
│   ├── routes.js              # Main router with API proxy endpoints
│   ├── config.json            # Service configuration
│   ├── views/
│   │   ├── index.html         # Homepage with version selector
│   │   ├── register-land-v3/  # Latest register land prototype
│   │   └── download-maps-v5/  # Latest download maps prototype
│   ├── assets/
│   │   ├── images/
│   │   ├── javascripts/
│   │   └── sass/
│   └── data/
├── .env                       # Environment variables (not in git)
├── package.json
├── README.md
└── CLAUDE.md                  # Detailed architecture documentation
```

## Accessing the Prototypes

Once running, visit `http://localhost:3000` to see the homepage with links to all prototype versions:

- **Register Land v3** (latest) - `/register-land-v3/start`
- **Download Maps v5** (latest) - `/download-maps-v5/start`

Older versions are also available for reference.

## Key Features

### Register Land (v3)
- Enter known parcel ID or estimate location on map
- Validate parcel IDs against RPA database
- View land covers and hedgerow data
- Upload supporting documentation
- Multi-parcel registration flow

### Download Maps (v5)
- Interactive map with RPA land parcel data
- Toggle between map styles (Outdoor, Dark, B&W, Satellite)
- View whole holding and individual parcel details
- Search and filter parcels
- Display land covers and hedgerow overlays

## API Key Setup

To use the mapping features, you need an Ordnance Survey API key:

1. Visit [OS Data Hub](https://osdatahub.os.uk/)
2. Sign up for a free account
3. Create a new project
4. Get your API key
5. Add it to `.env` as `OS_API_KEY=your-key-here`

The API key is kept server-side and injected via proxy routes for security.

## Development

This prototype uses the [GOV.UK Prototype Kit](https://prototype-kit.service.gov.uk/).

### Documentation

- **[CLAUDE.md](CLAUDE.md)** - Architecture overview, coding patterns, and development guidelines
- **[DEFRA-MAP-COMPONENT.md](DEFRA-MAP-COMPONENT.md)** - Comprehensive guide to the DEFRA map component including all plugins, configuration options, and usage examples

### Making Changes

- Views are in `app/views/` (Nunjucks templates)
- Routes are in `app/routes.js` and version-specific `_routes.js` files
- Styles are in `app/assets/sass/`
- Client-side JavaScript in `app/assets/javascripts/`

Session data persists across requests and is stored in `req.session.data`.

## Prototype Versioning

Each prototype iteration is preserved in its own directory (e.g., `register-land-v1`, `register-land-v2`, `register-land-v3`). This allows easy comparison between versions and maintains a history of design iterations.

## License

See [LICENCE.txt](LICENCE.txt)

## Support

For issues or questions about the GOV.UK Prototype Kit, visit the [official documentation](https://prototype-kit.service.gov.uk/).
