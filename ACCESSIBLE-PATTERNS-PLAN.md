# Accessible Patterns for Land Cover Map Fills

## Goal

Add distinguishing fill patterns (hatches, dots, crosshatch, etc.) to land cover map layers so colorblind users can differentiate between land cover types without relying solely on color.

## Current Implementation (Phase 1 - Complete)

Implemented in `app/views/download-maps-v5/get-maps-of-your-land-simple.html`:

- **Dual-layer approach**: Color fill via `datasetsPlugin.addDataset()` + pattern overlay via direct MapLibre `fill-pattern`
- **11 pattern types** generated via Canvas API: diagonal-hatch, crosshatch, horizontal-lines, vertical-lines, dense-dots, sparse-dots, dashes, grid, diagonal-reverse, circles, stipple
- **Pattern swatches** next to each checkbox showing color + pattern
- **Style change handling**: Patterns re-registered and re-added when map style changes

### Pattern Assignments

| Land Cover | Pattern | Color |
|------------|---------|-------|
| Permanent Grassland | diagonal-hatch (/) | #00703c |
| Arable Land | crosshatch (x) | #d4351c |
| Temporary Grassland | horizontal-lines (-) | #85994b |
| Woodland | dense-dots | #005a30 |
| Scrub - Ungrazeable | vertical-lines (\|) | #f47738 |
| Notional - Scrub | sparse-dots | #fd0 |
| Track - Natural Surface | dashes (- -) | #b58840 |
| Metalled track | dashes (- -) | #505a5f |
| Residential Gardens | diagonal-reverse (\\) | #912b88 |
| Hard Standings | grid (#) | #626a6e |
| Farm Building | grid (#) | #b1b4b6 |
| Permanent Crops | circles (o) | #4c2c92 |
| Fallow | stipple | #f3f2f1 |
| Fallow Land | stipple | #f3f2f1 |

---

## Phase 2 - Future Work

### Alternative Pattern Generation Approaches

The current Canvas API approach works but could be replaced with:

1. **SVG patterns** - More readable, declarative pattern definitions
2. **Static PNG files** - Designer-friendly, no code changes needed to tweak visuals
3. **Inline SVG data URIs** - Synchronous, no HTTP requests

See detailed comparison in conversation history.

### Port to Production Pages

Once validated in user research, port pattern code to:
- `app/views/download-maps-v5/get-maps-of-your-land.html`
- Other map pages as needed

### DEFRA Plugin Enhancement

Consider raising a feature request on `@defra/interactive-map` to add native `fillPattern` support to the datasets plugin.

---

## Pattern Image Resources

### Free SVG Pattern Libraries

#### PatternFills by Irene Ros (Recommended)
- **GitHub**: https://github.com/iros/patternfills
- **Live samples**: https://iros.github.io/patternfills/sample_svg.html
- **License**: MIT
- **Includes**: Diagonal stripes (6 variants), horizontal/vertical stripes (9 each), circles/dots (9 each), crosshatch, houndstooth

#### FreeSVG.org - Hatching Patterns
- **URL**: https://freesvg.org/hatching-patterns
- **License**: CC0 (Public Domain)
- Free for commercial use without attribution

#### Vecteezy Cross Hatch Patterns
- **URL**: https://www.vecteezy.com/free-vector/cross-hatch-pattern
- 1,000+ royalty-free cross-hatch pattern vectors

#### Freepik
- **URL**: https://www.freepik.com/free-photos-vectors/cross-hatch-svg
- Free graphic resources for cross hatch SVG vectors

### Code Examples & Tutorials

- **CodePen - SVG Diagonal Hatching**: https://codepen.io/layalk/pen/mmXpog
- **CodePen - SVG Crosshatch Pattern**: https://codepen.io/hellogareth/pen/zEBjQe
- **Observable - Simple SVG Hatching**: https://observablehq.com/@plmrry/simple-svg-hatching

### Government/Cartographic Standards

#### FGDC Digital Cartographic Standard
- **URL**: https://ngmdb.usgs.gov/fgdc_gds/geolsymstd.php
- Federal Geographic Data Committee's official standard
- Includes chart of commonly used geologic map patterns
- Available as PDF and ArcGIS styles

#### QGIS Styles Repository
- **Documentation**: https://docs.qgis.org/3.40/en/docs/training_manual/basic_map/symbology.html
- 160+ downloadable styles including land cover symbology

### Accessibility Guidance

#### Esri - Designing Maps for Colorblind Readability
- **URL**: https://www.esri.com/arcgis-blog/products/arcgis-pro/mapping/designing-maps-for-colorblind-readability
- Key recommendations:
  - Use **dual-encoding**: pair each color with a unique pattern
  - Hatching patterns create distinct boundaries through directional line work
  - Different hatch densities and angles create clear regional separation

#### ColorBrewer 2.0
- **URL**: https://colorbrewer2.org/
- Scientifically-tested colorblind-safe palettes for cartography
- Filter options for colorblind safe, print friendly, photocopy safe

---

## Verification Checklist

- [ ] Each land cover checkbox toggles colored fill + pattern overlay
- [ ] Patterns are visually distinct from each other at typical zoom levels
- [ ] Patterns are visible on all 4 map styles (Outdoor, Dark, B&W, Satellite)
- [ ] Toggling OFF removes both color and pattern
- [ ] Map key/legend shows land cover entries
- [ ] No console errors
- [ ] Style switching preserves active land cover layers and patterns
- [ ] User research validates pattern effectiveness for colorblind users
