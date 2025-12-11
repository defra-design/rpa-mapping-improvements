//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()


router.post("/register-land-v3/know-parcel-id", function (req, res) {
  
  if (req.session.data["knowParcelID"] == "yes") {
    
    // Store the parcel ID but don't create the parcel object yet
    // We'll create it after the map screenshot is captured on the confirm page
    const userEnteredId = req.session.data['parcel-id'];
    
    // Just store the ID and redirect to confirm page
    if (userEnteredId && userEnteredId.trim() !== '') {
      res.redirect("confirm-land-parcel-single-full-width");
    } else {
      // No ID entered, redirect back
      res.redirect("know-parcel-id");
    }
    
  } else {
    // Redirect to the alternative journey (estimate land parcel)
    res.redirect("estimate-land-parcel");
  }
});

// Confirm land parcel - NOW saves the parcel with screenshot
router.post("/register-land-v3/confirm-land-parcel-single-full-width", function (req, res) {
  
  // Initialize the parcels array if it doesn't exist
  if (!req.session.data['parcels']) {
    req.session.data['parcels'] = [];
  }
  
  // Get the parcel ID and map screenshot from the form
  const parcelId = req.session.data['parcel-id'];
  const mapScreenshot = req.body.mapScreenshot; // This comes from the hidden form field
  
  // Create the parcel object with the screenshot
  const newParcel = {
    id: parcelId,
    registeredDate: 'today',
    mapScreenshot: mapScreenshot || '/public/images/land-parcel-placeholder.png' // Fallback if screenshot fails
  };
  
  // Check if we're editing an existing parcel
  const parcelIndex = req.query.parcelIndex;
  
  if (parcelIndex !== undefined && req.session.data['parcels'][parcelIndex]) {
    // Update existing parcel
    req.session.data['parcels'][parcelIndex] = newParcel;
    console.log('Updated parcel at index:', parcelIndex);
  } else {
    // Add new parcel
    req.session.data['parcels'].push(newParcel);
    console.log('Added new parcel. Total parcels:', req.session.data['parcels'].length);
  }
  
  res.redirect("date-to-link-parcel-to-business");
});

// GET route for editing an existing parcel
router.get("/register-land-v3/confirm-land-parcel-single-full-width", function (req, res) {
  const parcelIndex = req.query.parcelIndex;
  
  // If editing an existing parcel, pre-populate the form
  if (parcelIndex !== undefined && req.session.data['parcels'] && req.session.data['parcels'][parcelIndex]) {
    const parcel = req.session.data['parcels'][parcelIndex];
    
    // Pre-populate the parcel ID
    req.session.data['parcel-id'] = parcel.id;
    
    console.log('Loading parcel for editing:', parcel.id);
  }
  
  // Let the default rendering happen
  res.render('register-land-v3/confirm-land-parcel-single-full-width');
});

// Find or estimate parcel ID
router.post("/register-land-v3/estimate-land-parcel", function (req, res) {
  res.redirect("upload-land-parcel-map");
});

// Upload land parcel map
router.post("/register-land-v3/upload-land-parcel-map", function (req, res) {
  res.redirect("date-to-link-parcel-to-business");
});

// Date to link parcel to business
router.post("/register-land-v3/date-to-link-parcel-to-business", function (req, res) {
  res.redirect("check-parcel-details");
});

// Check parcel details
router.post("/register-land-v3/check-parcel-details", function (req, res) {
  if (req.session.data["registerAnotherParcel"] == "yes") {
    // Clear the parcel ID for a fresh entry
    delete req.session.data['parcel-id'];
    res.redirect("know-parcel-id");
  } else if (req.session.data["registerAnotherParcel"] == "no") {
    res.redirect("declaration");
  }
});

// Date to link parcel to business
router.post("/register-land-v3/declaration", function (req, res) {
  res.redirect("confirmation");
});

// Delete land parcel
// router.post("/register-land-v3/delete-parcel", function (req, res) {
//   res.redirect("check-parcel-details");
// });

// --- 2. GET route to show the "Delete confirmation" page ---
// This is triggered when the user clicks the "Delete parcel" link on the summary page.
// The link must have data-bypass="true" in the Nunjucks attributes to hit this route.
router.get('/delete-parcel', function (req, res) {
  
  // The 'delete-parcel.html' template uses the query parameter to show the right parcel info.
  // We simply redirect to the Nunjucks file.
  res.redirect('/register-land-v3/delete-parcel');
});


// --- 3. POST route to process the final deletion confirmation ---
// This handles the form submission from the delete-parcel.html page (Yes/No radios).
router.post('/confirm-delete-parcel', function (req, res) {
  const confirmation = req.session.data['confirmDelete']; // Value is 'yes' or 'no'
  const indexToDelete = parseInt(req.session.data['index'], 10); // The array index passed from the form

  if (confirmation === 'yes') {
    // If the user confirms deletion, remove the item from the session array
    if (req.session.data['parcels'] && req.session.data['parcels'][indexToDelete]) {
      req.session.data['parcels'].splice(indexToDelete, 1);
    }
  } 
  
  // Redirect back to the main summary page
  res.redirect('/register-land-v3/check-parcel-details'); 
});

module.exports = router;