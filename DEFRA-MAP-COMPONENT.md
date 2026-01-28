# DEFRA Interactive Map Component Documentation

Comprehensive guide for the `@defra/interactive-map` component - an accessible mapping library for UK government digital services.

**Repository:** https://github.com/DEFRA/interactive-map
**Status:** Beta (API may change)

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Core Concepts](#core-concepts)
4. [Basic Usage](#basic-usage)
5. [Configuration Options](#configuration-options)
6. [Plugins](#plugins)
7. [Providers](#providers)
8. [Events](#events)
9. [Styling and Theming](#styling-and-theming)
10. [Advanced Examples](#advanced-examples)

---

## Overview

The DEFRA Map component is a React/JavaScript mapping library built on MapLibre GL, designed for UK government services. It provides:

- **Accessibility-first** design following GDS patterns
- **GOV.UK styling** integration out of the box
- **Modular plugin system** for extending functionality
- **Multiple map providers** support (MapLibre, ArcGIS)
- **Server-side API key injection** support for security
- **UMD and ESM builds** for flexible integration

### Technology Stack

- **Map Engine**: MapLibre GL JS (v1.15.3)
- **Spatial Operations**: Turf.js
- **UI Framework**: GOV.UK Frontend v5.13.0
- **Build System**: Webpack with Babel

---

## Installation

### Via npm
```bash
npm install @defra/interactive-map
```

### Via GitHub
```json
{
  "dependencies": {
    "@defra/interactive-map": "github:DEFRA/interactive-map"
  }
}
```

### Required Stylesheets

Include these CSS files in your HTML `<head>`:

```html
<link href="/plugin-assets/@defra/interactive-map/dist/css/index.css" rel="stylesheet">
<link href="/plugin-assets/@defra/interactive-map/plugins/map-styles/dist/css/index.css" rel="stylesheet">
<link href="/plugin-assets/@defra/interactive-map/plugins/search/dist/css/index.css" rel="stylesheet">
<link href="/plugin-assets/@defra/interactive-map/plugins/scale-bar/dist/css/index.css" rel="stylesheet">
<link href="/plugin-assets/@defra/interactive-map/plugins/datasets/dist/css/index.css" rel="stylesheet">
<link href="/plugin-assets/@defra/interactive-map/plugins/interact/dist/css/index.css" rel="stylesheet">
```

### Required Scripts (UMD)

Load scripts before your initialization code:

```html
<!-- Core library -->
<script src="/plugin-assets/@defra/interactive-map/dist/umd/index.js"></script>

<!-- Providers -->
<script src="/plugin-assets/@defra/interactive-map/providers/maplibre/dist/umd/index.js"></script>
<script src="/plugin-assets/@defra/interactive-map/providers/open-names/dist/umd/index.js"></script>

<!-- Plugins -->
<script src="/plugin-assets/@defra/interactive-map/plugins/map-styles/dist/umd/index.js"></script>
<script src="/plugin-assets/@defra/interactive-map/plugins/search/dist/umd/index.js"></script>
<script src="/plugin-assets/@defra/interactive-map/plugins/scale-bar/dist/umd/index.js"></script>
<script src="/plugin-assets/@defra/interactive-map/plugins/datasets/dist/umd/index.js"></script>
<script src="/plugin-assets/@defra/interactive-map/plugins/interact/dist/umd/index.js"></script>
```

---

## Core Concepts

### Map Container

The map requires a container element with an `id`:

```html
<div id="map" data-zoom="6" data-center="[-3.3767542,52.4433567]"></div>
```

**Data Attributes**:
- `data-zoom` - Initial zoom level
- `data-center` - Initial center coordinates `[longitude, latitude]`

### Loading State

Add a loading class to the body to show a loading indicator:

```html
<script>document.body.classList.add('am-is-loading')</script>
```

The component automatically removes this class when ready.

### Global Namespace

When using UMD builds, the library is available as `window.defra`:

```javascript
const interactiveMap = new defra.InteractiveMap('map', options);
```

---

## Basic Usage

### Minimal Example

```javascript
const interactiveMap = new defra.InteractiveMap('map', {
  mapProvider: defra.maplibreProvider(),
  behaviour: 'inline',
  containerHeight: '650px',
  mapStyle: {
    url: 'https://tiles.openfreemap.org/styles/liberty',
    attribution: 'OpenFreeMap © OpenMapTiles',
    backgroundColor: '#f5f5f0'
  }
});
```

### With Plugins

```javascript
const interactiveMap = new defra.InteractiveMap('map', {
  mapProvider: defra.maplibreProvider(),
  behaviour: 'inline',
  minZoom: 6,
  maxZoom: 18,
  containerHeight: '650px',
  plugins: [
    defra.mapStylesPlugin({
      mapStyles: [/* style definitions */]
    }),
    defra.searchPlugin({
      osNamesURL: '/api/geocode-proxy?query={query}'
    }),
    defra.scaleBarPlugin({ units: 'metric' })
  ]
});
```

---

## Configuration Options

### InteractiveMap Constructor Options

```javascript
new defra.InteractiveMap(containerId, options)
```

**Parameters**:

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `mapProvider` | Provider | Map rendering provider (required) | - |
| `reverseGeocodeProvider` | Provider | Reverse geocoding service | - |
| `behaviour` | String | Map display mode: `'inline'`, `'fullscreen'`, `'overlay'` | `'inline'` |
| `minZoom` | Number | Minimum zoom level | `0` |
| `maxZoom` | Number | Maximum zoom level | `22` |
| `containerHeight` | String | CSS height value | `'500px'` |
| `mapStyle` | Object | Initial map style configuration | - |
| `transformRequest` | Function | Transform tile requests (for API keys) | - |
| `plugins` | Array | Array of plugin instances | `[]` |

### Map Style Object

```javascript
{
  url: String,           // Style JSON URL
  attribution: String,   // Attribution text
  backgroundColor: String, // Background color
  mapColorScheme: String, // 'light' or 'dark'
  appColorScheme: String  // 'light' or 'dark'
}
```

### Transform Request Function

Use this to inject API keys server-side:

```javascript
function transformTileRequest(url, resourceType) {
  if (resourceType === 'Tile' && url.includes('api.os.uk')) {
    return {
      url: `/api/map-proxy?url=${encodeURIComponent(url)}`
    };
  }
  return { url };
}
```

---

## Plugins

### Map Styles Plugin

Allows users to switch between different map styles.

```javascript
defra.mapStylesPlugin({
  mapStyles: [{
    id: 'outdoor',
    label: 'Outdoor',
    url: 'https://example.com/style.json',
    thumbnail: '/path/to/thumbnail.jpg',
    logo: '/path/to/logo.svg',
    logoAltText: 'Logo description',
    attribution: 'Map data attribution',
    backgroundColor: '#f5f5f0',
    mapColorScheme: 'light',  // 'light' or 'dark'
    appColorScheme: 'light'   // 'light' or 'dark'
  }]
})
```

**Options**:
- `id` - Unique identifier for the style
- `label` - Display name in the UI
- `url` - MapLibre style JSON URL
- `thumbnail` - Preview image path
- `logo` - Logo image path (optional)
- `logoAltText` - Accessibility text for logo
- `attribution` - Map attribution text
- `backgroundColor` - Map background color
- `mapColorScheme` - Color scheme for map elements
- `appColorScheme` - Color scheme for UI controls

### Search Plugin

Geocoding search with autocomplete.

```javascript
defra.searchPlugin({
  osNamesURL: '/api/geocode-proxy?query={query}',
  customDatasets: [],
  width: '300px',
  showMarker: false,
  isExpanded: true
})
```

**Options**:
- `osNamesURL` - Geocoding API endpoint (use `{query}` placeholder)
- `customDatasets` - Array of custom search datasets
- `width` - Search box width
- `showMarker` - Show marker on selected location
- `isExpanded` - Start with search box expanded

**Custom Datasets Format**:
```javascript
[{
  name: 'Dataset Name',
  search: async (query) => {
    // Return array of results
    return [{
      label: 'Result Label',
      coordinates: [lng, lat],
      bounds: [minLng, minLat, maxLng, maxLat] // optional
    }];
  }
}]
```

### Zoom Controls

Zoom controls are now built into the core component. Enable them via the `enableZoomControls` option:

```javascript
new defra.InteractiveMap('map', {
  enableZoomControls: true,
  // ... other options
});
```

### Scale Bar Plugin

Shows map scale.

```javascript
defra.scaleBarPlugin({
  units: 'metric'  // 'metric' or 'imperial'
})
```

### Datasets Plugin

Display vector tile layers on the map (renamed from `dataLayersPlugin`).

```javascript
defra.datasetsPlugin({
  transformRequest: transformDataRequest,  // Optional request transformer
  datasets: [{
    id: 'field-parcels',
    label: 'Field parcels',
    tiles: ['https://tiles.example.com/{z}/{x}/{y}.pbf'],
    sourceLayer: 'layer_name',
    filter: ['==', ['get', 'property'], 'value'],  // Optional MapLibre filter
    stroke: '#0000ff',
    strokeWidth: 2,
    fill: 'rgba(0, 0, 255, 0.1)',
    minZoom: 10,
    maxZoom: 24
  }]
})
```

### Interact Plugin

Allows user interaction with map features (selection, markers).

```javascript
const interactPlugin = defra.interactPlugin({
  datasets: [{
    layerId: 'field-parcels',
    idProperty: 'ID',
    selectedFeatureStyle: {
      stroke: { outdoor: '#ff0000', dark: '#00ff00' },
      'stroke-width': 2,
      fill: 'rgba(255, 0, 0, 0.2)'
    }
  }],
  markerColor: { outdoor: '#ff0000', dark: '#00ff00' },
  interactionMode: 'select',  // 'marker' or 'select'
  multiSelect: true,          // Allow multiple feature selection
  hasSubsequentAction: false, // Show Done button outside fullscreen
  closeOnDone: true,          // Close app on Done
  closeOnCancel: true         // Close app on Cancel
})
```

**Options**:
- `datasets` - Layers that can be interacted with (renamed from `dataLayers`)
- `markerColor` - Marker color (can be object for different themes)
- `interactionMode` - Type of interaction: `'marker'` (click to place marker) or `'select'` (click to select features)
- `multiSelect` - Allow selecting multiple features (default: false)
- `hasSubsequentAction` - Show Done button when not in fullscreen mode
- `closeOnDone` - Close the map app when Done is clicked (default: true)
- `closeOnCancel` - Close the map app when Cancel is clicked (default: true)

#### Interact Plugin API Methods

Programmatically select or unselect features:

```javascript
// Select a feature
interactiveMap.api.interact.selectFeature({
  featureId: 'NY12345678',
  layerId: 'field-parcels',
  idProperty: 'ID'
})

// Unselect a feature
interactiveMap.api.interact.unselectFeature({
  featureId: 'NY12345678',
  layerId: 'field-parcels',
  idProperty: 'ID'
})
```

#### Interact Plugin Events

```javascript
// Fired when user clicks Done - contains selection data
interactiveMap.on('interact:done', (e) => {
  console.log('Coordinates:', e.coords);           // If marker mode
  console.log('Selected:', e.selectedFeatures);    // Array of selected features
  console.log('Bounds:', e.selectionBounds);       // [minX, minY, maxX, maxY]
})

// Fired when user clicks Cancel
interactiveMap.on('interact:cancel', () => {
  console.log('Selection cancelled');
})
```

#### Selection State Structure

Each selected feature contains:
```javascript
{
  featureId: 'NY12345678',
  layerId: 'field-parcels',
  idProperty: 'ID',
  properties: { /* feature properties */ },
  geometry: { /* GeoJSON geometry */ }
}
```

### Draw Plugin (MapLibre)

Drawing tools for creating and editing polygons on the map.

```javascript
defra.drawMLPlugin({
  // Options (if any)
})
```

**Features**:
- Draw new polygons with vertex-by-vertex placement
- Edit existing features (move vertices)
- Delete vertices from shapes
- Snap to existing points
- Undo support
- Keyboard and touch support

**Buttons provided**:
- `Done` - Complete the current drawing
- `Add point` - Add vertex (touch/keyboard mode)
- `Close shape` - Complete polygon (requires 3+ vertices)
- `Delete point` - Remove selected vertex
- `Snap to point` - Toggle snapping to existing points
- `Cancel` - Cancel current drawing

**Events**:
```javascript
// Listen for drawing completion
interactiveMap.on('draw:done', (e) => {
  console.log('Drawing completed:', e.feature);
})
```

### Use Location Plugin

Adds a "Use your location" button that centers the map on the user's GPS location.

```javascript
defra.useLocationPlugin()
```

**Features**:
- Uses browser Geolocation API
- Button hidden if geolocation not supported
- Shows error panel if location access fails

**Usage**:
```javascript
const interactiveMap = new defra.InteractiveMap('map', {
  plugins: [
    defra.useLocationPlugin()
  ]
});
```

### Frame Plugin

Adds a frame/border overlay to the map, useful for print layouts or highlighting areas.

```javascript
defra.framePlugin({
  // Options (if any)
})
```

**API Methods**:
```javascript
// Add a frame to the map
interactiveMap.api.frame.addFrame(options)

// Edit the frame
interactiveMap.api.frame.editFeature(options)
```

---

## Providers

### MapLibre Provider

The default map rendering provider.

```javascript
defra.maplibreProvider()
```

Uses MapLibre GL JS v1.15.3.

### Open Names Provider (Reverse Geocoding)

For reverse geocoding (coordinates → place name).

```javascript
defra.openNamesProvider({
  url: '/api/reverse-geocode-proxy?easting={easting}&northing={northing}'
})
```

**Placeholders**:
- `{easting}` - British National Grid easting
- `{northing}` - British National Grid northing

---

## Events

The map component uses an event system for inter-component communication.

### Listening to Events

```javascript
interactiveMap.on('event:name', (eventData) => {
  console.log('Event fired:', eventData);
});
```

### Available Events

#### `map:ready`

Fired when the map is fully initialized.

```javascript
interactiveMap.on('map:ready', (e) => {
  const map = e.map; // MapLibre map instance
  // Now safe to interact with map
});
```

#### `interact:markerchange`

Fired when a marker is placed or moved (interact plugin).

```javascript
interactiveMap.on('interact:markerchange', (e) => {
  console.log('Marker coords:', e.coords); // [lng, lat]
});
```

#### `interact:featureselected`

Fired when a feature is selected (interact plugin).

```javascript
interactiveMap.on('interact:featureselected', (e) => {
  console.log('Selected feature:', e.feature);
});
```

#### `map:stylechange`

Fired when the map style changes (map-styles plugin).

```javascript
interactiveMap.on('map:stylechange', (e) => {
  console.log('New style:', e.styleId);
});
```

### Accessing the Underlying Map

Get the MapLibre map instance for advanced operations:

```javascript
interactiveMap.on('map:ready', (e) => {
  const map = e.map;

  // Add custom layers, sources, etc.
  map.on('zoom', () => {
    console.log('Current zoom:', map.getZoom());
  });

  map.fitBounds(bounds, { padding: 50 });
});
```

---

## Styling and Theming

### Color Schemes

The component supports light and dark color schemes:

- `mapColorScheme` - Controls map element colors (roads, labels, etc.)
- `appColorScheme` - Controls UI control colors (buttons, search box, etc.)

```javascript
{
  id: 'dark-mode',
  label: 'Dark Mode',
  url: 'dark-style.json',
  mapColorScheme: 'dark',
  appColorScheme: 'dark'
}
```

### Custom Styling

Override component styles using CSS:

```css
/* Adjust map container */
.defra-map-container {
  border: 2px solid #0b0c0c;
}

/* Style zoom controls */
.defra-map-zoom-controls {
  /* your styles */
}

/* Style search box */
.defra-map-search {
  /* your styles */
}
```

### GOV.UK Integration

The component automatically integrates with GOV.UK Frontend. Ensure GOV.UK styles are loaded:

```html
<link href="/assets/govuk-frontend.min.css" rel="stylesheet">
```

---

## Advanced Examples

### Example 1: Interactive Parcel Selection

From `register-land-v3/estimate-land-parcel.html`:

```javascript
// Create interact plugin
const interactPlugin = defra.interactPlugin({
  markerColor: { outdoor: '#ff0000', dark: '#00ff00' },
  interactionMode: 'marker'
});

// Create map with plugins
const interactiveMap = new defra.InteractiveMap('map', {
  mapProvider: defra.maplibreProvider(),
  behaviour: 'inline',
  minZoom: 6,
  maxZoom: 18,
  containerHeight: '650px',
  plugins: [
    defra.mapStylesPlugin({
      mapStyles: [
        {
          id: 'outdoor',
          label: 'Outdoor',
          url: process.env.VTS_OUTDOOR_URL
        },
        {
          id: 'satellite',
          label: 'Satellite',
          url: '/satellite-style.json'
        }
      ]
    }),
    interactPlugin,
    defra.searchPlugin({
      osNamesURL: '/api/geocode-proxy?query={query}',
      width: '300px',
      isExpanded: true
    }),
    defra.scaleBarPlugin({ units: 'metric' })
  ]
});

// Handle marker placement
interactiveMap.on('interact:markerchange', (e) => {
  const coords = e.coords; // [lng, lat]
  document.querySelector('#coords').value = JSON.stringify(coords);

  // Enable submit button
  document.querySelector('#continue-btn').removeAttribute('disabled');
});

// Store zoom level
interactiveMap.on('map:ready', (e) => {
  const map = e.map;
  document.querySelector('#zoom').value = map.getZoom();

  map.on('zoom', () => {
    document.querySelector('#zoom').value = map.getZoom();
  });
});
```

### Example 2: Display Specific Parcel with Data

From `register-land-v3/confirm-land-parcel.html`:

```javascript
// Fetch parcel data
async function fetchParcelData(parcelId) {
  const url = `${process.env.PARCEL_SERVICE_URL}/${parcelId}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Initialize map
const interactiveMap = new defra.InteractiveMap('map', {
  mapProvider: defra.maplibreProvider(),
  behaviour: 'inline',
  containerHeight: '500px',
  plugins: [
    defra.scaleBarPlugin({ units: 'metric' })
  ]
});

// When map is ready, add parcel layer
interactiveMap.on('map:ready', async (e) => {
  const map = e.map;
  const parcelData = await fetchParcelData('AB123456');

  // Add parcel as source
  map.addSource('target-parcel', {
    type: 'geojson',
    data: parcelData
  });

  // Add parcel layer with styling
  map.addLayer({
    id: 'parcel-fill',
    type: 'fill',
    source: 'target-parcel',
    paint: {
      'fill-color': '#0000ff',
      'fill-opacity': 0.2
    }
  });

  map.addLayer({
    id: 'parcel-outline',
    type: 'line',
    source: 'target-parcel',
    paint: {
      'line-color': '#0000ff',
      'line-width': 3
    }
  });

  // Fit map to parcel bounds
  const bounds = getBounds(parcelData.geometry);
  map.fitBounds(bounds, { padding: 50 });
});
```

### Example 3: Custom Search with Parcel IDs

```javascript
// Custom dataset for searching parcels
const parcelSearchDataset = {
  name: 'Land Parcels',
  search: async (query) => {
    const url = `${process.env.PARCEL_SERVICE_URL}/${query}`;
    const response = await fetch(url);

    if (!response.ok) return [];

    const data = await response.json();
    return [{
      label: `Parcel ${data.properties.ngc}`,
      coordinates: calculateCenter(data.geometry),
      bounds: getBounds(data.geometry)
    }];
  }
};

// Use in search plugin
defra.searchPlugin({
  osNamesURL: '/api/geocode-proxy?query={query}',
  customDatasets: [parcelSearchDataset],
  width: '300px',
  isExpanded: true
})
```

### Example 4: API Key Proxy Pattern

Secure API key handling with server-side proxy:

```javascript
// Frontend: Transform requests to proxy
function transformTileRequest(url, resourceType) {
  if (resourceType === 'Tile' && url.includes('api.os.uk')) {
    return {
      url: `/api/map-proxy?url=${encodeURIComponent(url)}`
    };
  }
  return { url };
}

const interactiveMap = new defra.InteractiveMap('map', {
  mapProvider: defra.maplibreProvider(),
  transformRequest: transformTileRequest,
  // ... other options
});
```

```javascript
// Backend: Express proxy route (app/routes.js)
router.get('/api/map-proxy', async (req, res) => {
  try {
    const targetUrl = new URL(decodeURIComponent(req.query.url));

    // Add API key server-side
    targetUrl.searchParams.set('key', process.env.OS_API_KEY);

    const response = await fetch(targetUrl.toString());
    const buffer = await response.arrayBuffer();

    res.setHeader('content-type', response.headers.get('content-type'));
    res.status(response.status).send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send('Proxy failed');
  }
});
```

---

## Browser Support

The component supports modern browsers:

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

**Note**: MapLibre GL requires WebGL support.

---

## Troubleshooting

### Map Not Displaying

1. Check that all CSS files are loaded
2. Verify the container element exists with correct ID
3. Ensure container has explicit height (e.g., `containerHeight: '650px'`)
4. Check browser console for errors

### Tiles Not Loading

1. Verify API key is valid (if using OS tiles)
2. Check that `transformRequest` is correctly proxying requests
3. Check network tab for failed tile requests
4. Verify CORS headers on tile server

### Search Not Working

1. Verify geocoding endpoint URL is correct
2. Check that placeholders (`{query}`) are in the URL
3. Verify the proxy endpoint is working (check network tab)
4. Check console for JavaScript errors

### Plugins Not Loading

1. Ensure all plugin scripts are loaded before initialization
2. Check that plugin script paths are correct
3. Verify UMD global namespace is available (`window.defra`)
4. Check for console errors during plugin initialization

---

## Known Issues

### Overlay Components Not Visible on Initial Load

**Issue**: Some overlay components (Search, Key button, Layers button) may not be visible when the page first loads. They only appear after the browser window is resized.

**Affected components**:
- Search plugin search box
- Key button (from datasetsPlugin with `showInKey: true`)
- Layers button (from datasetsPlugin with `showInLayers: true`)

**Symptoms**:
- The component's container exists in the DOM but is not visible
- Resizing the browser window makes the component appear
- The component works correctly once visible

**Status**: Reported to component developer (January 2026)

**Workaround**: None currently. The components become visible after any browser resize event. A programmatic `window.dispatchEvent(new Event('resize'))` does not resolve the issue.

### Key Button Requires Initial Dataset Configuration

**Issue**: The Key button only appears if at least one dataset with `showInKey: true` is included in the initial `datasetsPlugin` configuration. Dynamically adding datasets with `showInKey: true` via `datasetsPlugin.addDataset()` does not make the Key button appear.

**Workaround**: Include a placeholder dataset in the initial configuration:

```javascript
const datasetsPlugin = defra.datasetsPlugin({
  datasets: [{
    id: 'placeholder',
    label: 'placeholder',
    geojson: { type: 'FeatureCollection', features: [] },
    showInKey: true,
    showInLayers: false,
    visibility: 'hidden'
  }]
});
```

The placeholder will not display in the Key (no features), but it enables the Key button to appear.

### Search Plugin Hides Other Overlays When Expanded (Expected Behavior)

**Behavior**: When the search input is expanded (by clicking the search icon), other overlay buttons (Key, Map Styles, Zoom controls) are hidden.

**What happens**:
- Click the search icon to expand the search input
- Other overlay buttons (Key, Map Styles, Zoom +/-) are hidden
- Closing the search input makes the other overlays reappear

**Affected components**:
- Key button (datasetsPlugin)
- Map Styles button (mapStylesPlugin)
- Zoom controls

**Reason**: This is intentional design to prevent overlays from overlapping on smaller screens. Users must close the search input to access other map controls.

---

### Interact Plugin Must Be Explicitly Enabled

**Issue**: The interact plugin does not automatically enable when included in the plugins array. You must call `interactPlugin.enable()` after the map and target layers are ready.

**Example**:
```javascript
interactiveMap.on('map:ready', async (e) => {
  // Add your layers first
  map.addSource('parcels', { type: 'geojson', data: geojsonData });
  map.addLayer({ id: 'parcels-fill', type: 'fill', source: 'parcels', ... });

  // Then enable the interact plugin
  interactPlugin.enable();
});
```

---

## Performance Tips

1. **Limit initial zoom extent** - Use `minZoom` and `maxZoom` to prevent loading unnecessary tiles
2. **Use vector tiles** - More performant than raster tiles for complex data
3. **Lazy load plugins** - Only include plugins you actually use
4. **Debounce custom interactions** - Throttle frequent events like zoom or pan
5. **Optimize GeoJSON** - Simplify geometries for large datasets before adding to map

---

## Accessibility

The component follows GDS accessibility patterns:

- Keyboard navigation support
- ARIA labels on all controls
- Focus management
- Screen reader announcements for state changes
- High contrast mode support

Ensure you:
- Provide meaningful `alt` text for logos and thumbnails
- Test with keyboard navigation
- Test with screen readers
- Maintain color contrast ratios

---

## Further Resources

- [MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js-docs/api/)
- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [Ordnance Survey APIs](https://osdatahub.os.uk/)
- [DEFRA Interactive Map GitHub Repository](https://github.com/DEFRA/interactive-map)

---

## Feature Requests for Plugin Developer

The following features would improve GeoJSON workflow support:

### 1. GeoJSON Support for Interact Plugin

**Current limitation**: The `interactPlugin` only works with layers created by `datasetsPlugin` (vector tiles). It cannot detect clicks on GeoJSON layers added manually via `map.addLayer()`.

**Requested feature**: Allow `interactPlugin` to work with any layer on the map, including dynamically added GeoJSON layers.

**Use case**: Selecting land parcels loaded from WFS endpoints as GeoJSON, with automatic selection state management and `interact:selectionchange` events.

**Current workaround**: Manual click handlers on the GeoJSON layer with custom selection state management.

### 2. GeoJSON Support for showInKey (Legend)

**Current limitation**: The `showInKey: true` property in `datasetsPlugin` only works with vector tile datasets. GeoJSON layers added manually cannot be included in the automatic legend/key.

**Requested feature**: Allow dynamically added GeoJSON layers to register with the key/legend system, either through:
- A new plugin method: `interactiveMap.api.key.addLayer({ id, label, fill, stroke })`
- Or extending `datasetsPlugin` to support GeoJSON sources

**Use case**: Displaying land cover types with their colours in an automatic legend, without hardcoding colour mappings in the application.

**Current workaround**: Hardcoded legend component with manual colour mapping that must be kept in sync with layer paint properties.

---

## Version

This documentation is for **@defra/interactive-map v0.0.1-alpha**.

**Status**: Beta - API may change in future releases. Full documentation will be published when the project reaches stable release.
