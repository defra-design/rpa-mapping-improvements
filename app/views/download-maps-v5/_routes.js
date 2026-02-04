//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

// Demo start page - set defaults if fields are empty
router.post('/download-maps-v5/demo-start', function (req, res) {
  // Use defaults if fields are empty
  if (!req.session.data['farm-name'] || req.session.data['farm-name'].trim() === '') {
    req.session.data['farm-name'] = 'Cannon Hall Farm';
  }
  if (!req.session.data['sbi'] || req.session.data['sbi'].trim() === '') {
    req.session.data['sbi'] = '106332870';
  }
  res.redirect('/download-maps-v5/start');
});

// Main map page
router.post('/download-maps-v5/get-maps-of-your-land', function (req, res) {
  console.log('Saved selections:', {
    parcels: req.session.data['selected-parcels'],
    landCovers: req.session.data['selected-land-covers'],
    hedgerows: req.session.data['hedgerows-enabled']
  });
  res.redirect('/download-maps-v5/map-pack-contents');
});

// Save map selections to session
router.post('/download-maps-v5/get-maps-of-your-land-poc-4', function (req, res) {
  // Data is automatically saved to session by the prototype kit
  // via req.session.data (from form fields)

  // Log selections for debugging
  console.log('Saved selections:', {
    parcels: req.session.data['selected-parcels'],
    landCovers: req.session.data['selected-land-covers'],
    hedgerows: req.session.data['hedgerows-enabled']
  });

  // Redirect to a confirmation page or back to the map
  // For now, redirect to a simple confirmation
  res.redirect('/download-maps-v5/map-pack-contents');
});

// POC-5: DEFRA Interactive Map Component version
router.post('/download-maps-v5/get-maps-of-your-land-poc-5', function (req, res) {
  // Data is automatically saved to session by the prototype kit
  // via req.session.data (from form fields)

  // Log selections for debugging
  console.log('POC-5 Saved selections:', {
    parcels: req.session.data['selected-parcels'],
    landCovers: req.session.data['selected-land-covers'],
    hedgerows: req.session.data['hedgerows-enabled']
  });

  // Redirect to confirmation page
  res.redirect('/download-maps-v5/map-pack-contents');
});

// Rename Option A: Always visible input
router.post('/download-maps-v5/rename-option-a', function (req, res) {
  console.log('Rename Option A selections:', {
    parcels: req.session.data['selected-parcels'],
    fieldNames: req.session.data['parcel-field-names']
  });
  res.redirect('/download-maps-v5/map-pack-contents');
});

// Rename Option B: "Rename" link reveals input
router.post('/download-maps-v5/rename-option-b', function (req, res) {
  console.log('Rename Option B selections:', {
    parcels: req.session.data['selected-parcels'],
    fieldNames: req.session.data['parcel-field-names']
  });
  res.redirect('/download-maps-v5/map-pack-contents');
});

// Rename Option C: Single toggle for all
router.post('/download-maps-v5/rename-option-c', function (req, res) {
  console.log('Rename Option C selections:', {
    parcels: req.session.data['selected-parcels'],
    fieldNames: req.session.data['parcel-field-names']
  });
  res.redirect('/download-maps-v5/map-pack-contents');
});

module.exports = router;