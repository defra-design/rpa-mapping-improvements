//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require("govuk-prototype-kit");
const router = govukPrototypeKit.requests.setupRouter();

router.use((req, res, next) => {

  next()
})

router.use((req, res, next) => {
  res.locals.data = res.locals.data || {}
  res.locals.data.WFS_SERVICE_URL = process.env.WFS_SERVICE_URL
  res.locals.data.WFS_DATA_URL = process.env.WFS_DATA_URL
  res.locals.data.WFS_HEDGEROWS_URL = process.env.WFS_HEDGEROWS_URL
  res.locals.data.WFS_LANDCOVERS_URL = process.env.WFS_LANDCOVERS_URL
  res.locals.data.GRIDREF_SERVICE_URL = process.env.GRIDREF_SERVICE_URL
  res.locals.data.PARCEL_SERVICE_URL = process.env.PARCEL_SERVICE_URL
  res.locals.data.VTS_OUTDOOR_URL = process.env.VTS_OUTDOOR_URL
  res.locals.data.VTS_DARK_URL = process.env.VTS_DARK_URL
  res.locals.data.VTS_BLACK_AND_WHITE_URL = process.env.VTS_BLACK_AND_WHITE_URL

  res.locals.query = req.query;
  res.locals.path = req.path;

  next();
});

// Routes setup
const rl1 = require("./views/register-land-v1/_routes");
router.use("register-land-v1", rl1);

const rl2 = require("./views/register-land-v2/_routes");
router.use("register-land-v2", rl2);

const rl3 = require("./views/register-land-v3/_routes");
router.use("register-land-v3", rl3);

const dm1 = require("./views/download-maps-v1/_routes");
router.use("download-maps", dm1);

const dm2 = require("./views/download-maps-v2/_routes");
router.use("download-maps", dm2);

const dm3 = require("./views/download-maps-v3/_routes");
router.use("download-maps", dm3);

// Proxy OS Vector Tile Styles
router.get('/api/map-proxy', async (req, res) => {
  try {
    if (!req.query.url) return res.status(400).send('Missing url')

    const targetUrl = new URL(decodeURIComponent(req.query.url))
    
    // Add API key server-side
    targetUrl.searchParams.set('key', process.env.OS_API_KEY)
    if (!targetUrl.searchParams.has('srs')) {
      targetUrl.searchParams.set('srs', '3857')
    }

    const response = await fetch(targetUrl.toString())
    const buffer = await response.arrayBuffer()
    
    const contentType = response.headers.get('content-type')
    if (contentType) res.setHeader('content-type', contentType)
    
    res.status(response.status).send(Buffer.from(buffer))

  } catch (err) {
    console.error('Proxy error:', err)
    res.status(500).send('Proxy failed')
  }
})

// Proxy endpoint for OS Names API (find)
router.get('/api/geocode-proxy', async (req, res) => {
  try {
    const baseUrl = process.env.OS_NAMES_URL
    const url = new URL(baseUrl)

    Object.keys(req.query).forEach(key => url.searchParams.set(key, req.query[key]))
    url.searchParams.set('key', process.env.OS_API_KEY)

    const response = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } })
    const data = await response.json()

    // Remove the URI field from the header
    if (data.header && data.header.uri) {
      data.header.uri = '/api/geocode-proxy'
    }

    res.json(data)

  } catch (err) {
    console.error('OS Names API error:', err)
    res.status(500).json({ error: 'Service unavailable' })
  }
})

// Proxy endpoint for OS Names API (nearest) 
router.get('/api/reverse-geocode-proxy', async (req, res) => {
  try {
    const baseUrl = process.env.OS_NEAREST_URL
    const url = new URL(baseUrl)

    url.searchParams.set('point', `${req.query['easting']},${req.query['northing']}`)
    url.searchParams.set('key', process.env.OS_API_KEY)

    const response = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } })
    const data = await response.json()

    // Remove the URI field from the header
    if (data.header && data.header.uri) {
      data.header.uri = '/api/reverse-geocode-proxy'
    }

    res.json(data)

  } catch (err) {
    console.error('OS Names API error:', err)
    res.status(500).json({ error: 'Service unavailable' })
  }
})
  // Loading arial photography
  router.get('/satellite-style.json', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify({
      "version": 8,
      "name": "Satellite",
      "sources": {
        "satellite": {
          "type": "raster",
          "tiles": [
            "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          ],
          "tileSize": 256,
          "attribution": "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
          "scheme": "xyz"
        }
      },
      "layers": [
        {
          "id": "satellite-layer",
          "type": "raster",
          "source": "satellite",
          "minzoom": 0,
          "maxzoom": 22
        }
      ]
    }))
  })
