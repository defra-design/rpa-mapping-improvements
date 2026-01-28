//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

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
  res.redirect('/download-maps-v5/download-confirmation');
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
  res.redirect('/download-maps-v5/download-confirmation');
});

module.exports = router;