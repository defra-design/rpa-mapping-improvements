const osAuth = {}

const transformTileRequest = (url, resourceType) => {
  // Only proxy OS API requests that don't already have a key
  if (resourceType !== 'Style' && url.startsWith('https://api.os.uk')) {
    const urlObj = new URL(url)
    if (!urlObj.searchParams.has('key')) {
      return {
        url: `/api/map-proxy?url=${encodeURIComponent(url)}`,
        headers: {}
      }
    }
  }
  return { url, headers: {} }
}

const transformDataRequest = (request, bbox) => {
  return {
    url: `${env.WFS_SERVICE_URL}?wfs_url=${encodeURIComponent(request.url)}&bbox=${bbox}`
  }
}

window.transformTileRequest = transformTileRequest
window.transformDataRequest = transformDataRequest