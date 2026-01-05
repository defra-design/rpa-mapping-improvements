//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

router.get("/register-land-v3/know-parcel-id", async function (req, res) {
  // ALWAYS prevent bfcache to ensure back button triggers a fresh GET
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  // Get error and value from session if they exist (from a redirect after POST error)
  const radioError = req.session.data['know-parcel-id-radio-error'];
  const inputError = req.session.data['know-parcel-id-input-error'];
  const value = req.session.data['know-parcel-id-value'];
  const knowParcelID = req.session.data['knowParcelID'];
  
  // Clear them from session after reading
  delete req.session.data['know-parcel-id-radio-error'];
  delete req.session.data['know-parcel-id-input-error'];
  delete req.session.data['know-parcel-id-value'];
  
  // Only keep knowParcelID if there's an error (so the form can show what was selected)
  // Otherwise clear it so the form starts fresh
  if (!radioError && !inputError) {
    delete req.session.data['knowParcelID'];
  }
  
  return res.render('register-land-v3/know-parcel-id', {
    value: value || '',
    radioError: radioError || null,
    inputError: inputError || null,
    knowParcelID: knowParcelID
  })
})

router.post("/register-land-v3/know-parcel-id", async function (req, res) {
  // Check if a radio option was selected
  if (!req.session.data['knowParcelID']) {
    req.session.data['know-parcel-id-radio-error'] = { text: 'Select Yes if you know the Parcel Id' };
    return res.redirect('/register-land-v3/know-parcel-id');
  }

  if (req.session.data['knowParcelID'] == 'yes') {
    const userEnteredId = req.body['parcel-id']?.trim()

    // Check if parcel ID was entered
    if (!userEnteredId) {
      req.session.data['know-parcel-id-input-error'] = { text: 'Enter the parcel ID' };
      req.session.data['know-parcel-id-value'] = '';
      return res.redirect('/register-land-v3/know-parcel-id');
    }

    // Not valid parcelId format
    const validParcelId = /^[A-Z]{2}\s?\d{4}\s?\d{4}$/i
    if (!validParcelId.test(userEnteredId)) {
      req.session.data['know-parcel-id-input-error'] = { text: 'Parcel ID is not a valid format' };
      req.session.data['know-parcel-id-value'] = userEnteredId;
      return res.redirect('/register-land-v3/know-parcel-id');
    }

    const formattedParcelId = userEnteredId.replaceAll(' ','').toUpperCase()
    const url = `${process.env.PARCEL_SERVICE_URL}/${formattedParcelId}`
    const response = await fetch(url)
    const data = await response.json()
    const parcelId = data.properties?.ngc

    // Not an existing parcel
    if (!parcelId) {
      req.session.data['know-parcel-id-input-error'] = { text: 'Parcel ID doesn\'t exist' };
      req.session.data['know-parcel-id-value'] = userEnteredId;
      return res.redirect('/register-land-v3/know-parcel-id');
    }

    // Valid existing parcelId
    req.session.data['parcel-id'] = parcelId;
    return res.redirect('confirm-land-parcel')
    
  } else {
    return res.redirect('estimate-land-parcel')
  }
})

// GET route for editing an existing parcel
router.get("/register-land-v3/confirm-land-parcel", async function (req, res) {
  const parcelId = req.session.data['parcel-id'];
  const url = `${process.env.PARCEL_SERVICE_URL}/${parcelId}`
  const response = await fetch(url)
  const data = await response.json()
  console.log(data)

  // Should this be here?
  //req.session.data['parcel-bounds'] = data?.bounds;

  // If editing an existing parcel, pre-populate the form
  if (parcelId !== undefined && req.session.data['parcels'] && req.session.data['parcels'][parcelId]) {
    // Pre-populate the parcel ID
    req.session.data['parcel-bounds'] = data?.bounds;
  }
  
  // Let the default rendering happen
  res.render('register-land-v3/confirm-land-parcel', {
    parcelId: req.session.data['parcel-id'],
    parcelBounds: req.session.data['parcel-bounds']
  })
})


















































// Confirm land parcel - NOW saves the parcel with screenshot
router.post("/register-land-v3/confirm-land-parcel", function (req, res) {
  
  // Initialize the parcels array if it doesn't exist
  if (!req.session.data['parcels']) {
    req.session.data['parcels'] = []
  }
  
  // Get the parcel ID and map screenshot from the form
  const parcelId = req.session.data['parcel-id']
  const mapScreenshot = req.body.mapScreenshot; // This comes from the hidden form field
  
  // Create the parcel object with the screenshot
  const newParcel = {
    id: parcelId,
    registeredDate: 'today',
    mapScreenshot: mapScreenshot || '/public/images/land-parcel-placeholder.png' // Fallback if screenshot fails
  }

  if (parcelId !== undefined && req.session.data['parcels'][parcelId]) {
    // Update existing parcel
    req.session.data['parcels'][parcelId] = newParcel
    console.log('Updated parcel at index:', parcelId)
  } else {
    // Add new parcel
    req.session.data['parcels'].push(newParcel)
    console.log('Added new parcel. Total parcels:', req.session.data['parcels'].length)
  }
  
  res.redirect("date-to-link-parcel-to-business")
})

// Find or estimate parcel ID
router.post("/register-land-v3/estimate-land-parcel", async function (req, res) {
  const coords = JSON.parse(req.body.coords)
  const url = `${process.env.PARCEL_BY_COORD_SERVICE_URL}?lon=${coords[0]}&lat=${coords[1]}`
  const response = await fetch(url)
  const data = await response.json()
  
  // Do you need these inthe session state?
  req.session.data['parcel-id'] = data.properties?.ngc;
  req.session.data['parcel-bounds'] = data?.bounds;

  res.redirect("estimate-land-parcel-confirm");
});

// New get route for estimate-land-parcel-confirm
router.get('/register-land-v3/estimate-land-parcel-confirm', function (req, res) {
  res.render('register-land-v3/estimate-land-parcel-confirm', {
    parcelId: req.session.data['parcel-id'],
    parcelBounds: req.session.data['parcel-bounds']
  })
})

// Confirm find or estimate parcel ID
// router.post("/register-land-v3/estimate-land-parcel-confirm", function (req, res) {
//   res.redirect("upload-land-parcel-map");
// });

router.post('/register-land-v3/estimate-land-parcel-confirm', function (req, res) {

  var country = req.session.data['signIn']
  if (country == "no-parcel-id") {
    res.redirect("upload-land-parcel-map")
  } else if (country == "found-parcel-id") {
    res.redirect("date-to-link-parcel-to-business")
  } else if (country == "changes-to-found-parcel") {
    res.redirect("upload-land-parcel-map")
  } else {
    res.redirect("estimate-land-parcel")
  }
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