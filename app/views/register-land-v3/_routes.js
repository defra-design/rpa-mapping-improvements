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

// // GET route for editing an existing parcel
// router.get("/register-land-v3/confirm-land-parcel", async function (req, res) {
//   // Parcel service
//   const parcelId = req.session.data['parcel-id'];
//   const url = `${process.env.PARCEL_SERVICE_URL}/${parcelId}`
//   const response = await fetch(url)
//   const data = await response.json()
//   console.log(data)

//   // Meta data
//   const metaDataUrl = `https://environment.data.gov.uk/data-services/RPA/LandCovers/wfs?version=2.0.0&request=GetFeature&typeNames=RPA:LandCovers&cql_filter=SBI=${data?.properties?.sbi}&srsname=EPSG:4326&outputFormat=application/json`
//   const metaDataResponse = await fetch(metaDataUrl)
//   const metaData = await metaDataResponse.json()

//   const sheetId = data?.properties?.ngc.slice(0, 6)
//   const fieldRef = data?.properties?.ngc.slice(-4)
//   const landCovers = metaData.features.filter(f => f.properties.SHEET_ID === sheetId && f.properties.PARCEL_ID === fieldRef).map(f => f.properties)
//   console.log(landCovers)

//   // Should this be here?
//   req.session.data['parcel-bounds'] = data?.bounds;

//   // If editing an existing parcel, pre-populate the form
//   // if (parcelId !== undefined && req.session.data['parcels'] && req.session.data['parcels'][parcelId]) {
//   //   // Pre-populate the parcel ID
//   //   req.session.data['parcel-bounds'] = data?.bounds;
//   // }
  
//   // Let the default rendering happen
//   res.render('register-land-v3/confirm-land-parcel', {
//     parcelId: req.session.data['parcel-id'],
//     parcelBounds: req.session.data['parcel-bounds'],
//     landCovers
//   })
// })

router.get("/register-land-v3/confirm-land-parcel", async function (req, res) {
  const parcelId = req.session.data['parcel-id'];
  
  try {
    // 1. Fetch parcel service data
    const url = `${process.env.PARCEL_SERVICE_URL}/${parcelId}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('Parcel data:', data);
    
    const sbi = data?.properties?.sbi;
    const ngc = data?.properties?.ngc;
    const sheetId = ngc?.slice(0, 6);
    const fieldRef = ngc?.slice(-4);
    
    // 2. Fetch land covers
    const landCoversUrl = `https://environment.data.gov.uk/data-services/RPA/LandCovers/wfs?version=2.0.0&request=GetFeature&typeNames=RPA:LandCovers&cql_filter=SBI=${sbi}&srsname=EPSG:4326&outputFormat=application/json`;
    const landCoversResponse = await fetch(landCoversUrl);
    const landCoversData = await landCoversResponse.json();
    
    // Filter land covers for this specific parcel
    const landCovers = landCoversData.features
      .filter(f => f.properties.SHEET_ID === sheetId && f.properties.PARCEL_ID === fieldRef)
      .map(f => f.properties);
    
    console.log('Land covers:', landCovers);
    
    // 3. Fetch hedgerows
    const hedgerowsUrl = `https://environment.data.gov.uk/data-services/RPA/HedgeControl/wfs?version=2.0.0&request=GetFeature&typeNames=RPA:HedgeControl&cql_filter=SBI=${sbi}&srsname=EPSG:4326&outputFormat=application/json`;
    const hedgerowsResponse = await fetch(hedgerowsUrl);
    const hedgerowsData = await hedgerowsResponse.json();
    
    // Filter hedgerows for this specific parcel
    const hedgerows = hedgerowsData.features
      .filter(f => f.properties.REF_PARCEL_SHEET_ID === sheetId && f.properties.REF_PARCEL_PARCEL_ID === fieldRef)
      .map(f => f.properties);
    
    console.log('Hedgerows:', hedgerows);
    
    // Calculate total hedgerow length
    const totalHedgerowLength = hedgerows.reduce((sum, hedge) => {
      return sum + (parseFloat(hedge.LENGTH) || 0);
    }, 0);
    
    console.log('Total hedgerow length:', totalHedgerowLength.toFixed(2), 'metres');
    
    // Store parcel bounds in session
    req.session.data['parcel-bounds'] = data?.bounds;
    
    // Render the page
    res.render('register-land-v3/confirm-land-parcel', {
      parcelId: req.session.data['parcel-id'],
      parcelBounds: req.session.data['parcel-bounds'],
      sbi: sbi,
      landCovers: landCovers,
      hedgerows: hedgerows,
      totalHedgerowLength: totalHedgerowLength.toFixed(2)
    });
    
  } catch (error) {
    console.error('Error in confirm-land-parcel route:', error);
    
    // Render error state
    res.render('register-land-v3/confirm-land-parcel', {
      parcelId: req.session.data['parcel-id'],
      error: 'Unable to load parcel data. Please try again.',
      sbi: '',
      landCovers: [],
      hedgerows: [],
      totalHedgerowLength: '0.00'
    });
  }
});



















































// // Confirm land parcel - NOW saves the parcel with screenshot
// router.post("/register-land-v3/confirm-land-parcel", function (req, res) {
  
//   // Initialize the parcels array if it doesn't exist
//   if (!req.session.data['parcels']) {
//     req.session.data['parcels'] = []
//   }
  
//   // Get the parcel ID and map screenshot from the form
//   const parcelId = req.session.data['parcel-id']
//   const mapScreenshot = req.body.mapScreenshot; // This comes from the hidden form field
  
//   // Create the parcel object with the screenshot
//   const newParcel = {
//     id: parcelId,
//     registeredDate: 'today',
//     mapScreenshot: mapScreenshot || '/public/images/land-parcel-placeholder.png' // Fallback if screenshot fails
//   }

//   if (parcelId !== undefined && req.session.data['parcels'][parcelId]) {
//     // Update existing parcel
//     req.session.data['parcels'][parcelId] = newParcel
//     console.log('Updated parcel at index:', parcelId)
//   } else {
//     // Add new parcel
//     req.session.data['parcels'].push(newParcel)
//     console.log('Added new parcel. Total parcels:', req.session.data['parcels'].length)
//   }
  
//   res.redirect("date-to-link-parcel-to-business")
// })


router.post("/register-land-v3/confirm-land-parcel", function (req, res) {
  // Initialize the parcels array if it doesn't exist
  if (!req.session.data['parcels']) {
    req.session.data['parcels'] = [];
  }
  
  // Get the parcel ID from the form
  const parcelId = req.session.data['parcel-id'];
  
  // Create the parcel object
  const newParcel = {
    id: parcelId,
    registeredDate: 'today',
    isEstimated: false
  };
  
  if (parcelId !== undefined && req.session.data['parcels'][parcelId]) {
    // Update existing parcel
    req.session.data['parcels'][parcelId] = newParcel;
    console.log('Updated parcel at index:', parcelId);
  } else {
    // Add new parcel
    req.session.data['parcels'].push(newParcel);
    console.log('Added new parcel. Total parcels:', req.session.data['parcels'].length);
  }
  
  res.redirect("date-to-link-parcel-to-business");
});





// Find or estimate parcel ID
router.post("/register-land-v3/estimate-land-parcel", async function (req, res) {
  console.log(req.body)
  const coords = JSON.parse(req.body.coords)
  const zoom = req.body.zoom
  const url = `${process.env.PARCEL_BY_COORD_SERVICE_URL}?lon=${coords[0]}&lat=${coords[1]}`
  const response = await fetch(url)
  const data = await response.json()
  
  // Do you need these inthe session state?
  req.session.data['parcel-id'] = data.properties?.ngc;
  req.session.data['parcel-bounds'] = data?.bounds;
  req.session.data['estimate-coords'] = coords;
  req.session.data['estimate-zoom'] = zoom;

  res.redirect("estimate-land-parcel-confirm");
});

// New get route for estimate-land-parcel-confirm
router.get('/register-land-v3/estimate-land-parcel-confirm', function (req, res) {
  res.render('register-land-v3/estimate-land-parcel-confirm', {
    parcelId: req.session.data['parcel-id'],
    parcelBounds: req.session.data['parcel-bounds'],
    coords: req.session.data['estimate-coords'],
    zoom: req.session.data['estimate-zoom']
    
  })
})



// router.post('/register-land-v3/estimate-land-parcel-confirm', function (req, res) {

//   var country = req.session.data['signIn']
//   if (country == "no-parcel-id") {
//     res.redirect("upload-land-parcel-map")
//   } else if (country == "found-parcel-id") {
//     res.redirect("date-to-link-parcel-to-business")
//   } else if (country == "changes-to-found-parcel") {
//     res.redirect("upload-land-parcel-map")
//   } else {
//     res.redirect("estimate-land-parcel")
//   }
// });

// router.post('/register-land-v3/estimate-land-parcel-confirm', function (req, res) {
//   var country = req.session.data['signIn']
  
//   if (country == "no-parcel-id") {
//     // Initialize the parcels array if it doesn't exist
//     if (!req.session.data['parcels']) {
//       req.session.data['parcels'] = [];
//     }
    
//     // Create dummy estimated parcel ID
//     const estimatedParcelId = 'EST' + Date.now();
    
//     const newParcel = {
//       id: estimatedParcelId,
//       registeredDate: 'today',
//       isEstimated: true,
//       bounds: req.session.data['parcel-bounds'],
//       // fileUpload: 'test-file.pdf'  // Add this for testing
//     };
    
//     req.session.data['parcels'].push(newParcel);
//     req.session.data['parcel-id'] = estimatedParcelId;
//     console.log('Added estimated parcel. Total parcels:', req.session.data['parcels'].length);
    
//     res.redirect("upload-land-parcel-map")
//   } else if (country == "found-parcel-id") {
//     // Initialize the parcels array if it doesn't exist
//     if (!req.session.data['parcels']) {
//       req.session.data['parcels'] = [];
//     }
    
//     const parcelId = req.session.data['parcel-id'];
//     const parcelBounds = req.session.data['parcel-bounds'];
    
//     const newParcel = {
//       id: parcelId,
//       registeredDate: 'today',
//       isEstimated: false,
//       bounds: parcelBounds
//     };
    
//     req.session.data['parcels'].push(newParcel);
//     console.log('Added found parcel. Total parcels:', req.session.data['parcels'].length);
    
//     res.redirect("date-to-link-parcel-to-business")
//   } else if (country == "changes-to-found-parcel") {
//     res.redirect("upload-land-parcel-map")
//   } else {
//     res.redirect("estimate-land-parcel")
//   }
// });

router.post('/register-land-v3/estimate-land-parcel-confirm', function (req, res) {
  var country = req.session.data['signIn']

// Function to generate a realistic estimated parcel ID
function generateEstimatedParcelId() {
  // Common UK Ordnance Survey grid squares
  const osGridSquares = [
    'NY', 'SD', 'TQ', 'SJ', 'SE', 'SK', 'SO', 'SP', 'ST', 'SU', 'SZ', 'TA', 'TF', 'TG', 'TL', 'TM',
    'TR', 'TV', 'NC', 'ND', 'NF', 'NG', 'NH', 'NJ', 'NK', 'NL', 'NM', 'NN', 'NO', 'NR', 'NS', 'NT',
    'NU', 'NW', 'NX', 'NZ', 'OV', 'SC', 'SH', 'SM', 'SN', 'SR', 'SS', 'SX', 'SY', 'HT', 'HU', 'HW',
    'HX', 'HY', 'HZ', 'NA', 'NB'
  ];
  
  // Pick a random grid square
  const letters = osGridSquares[Math.floor(Math.random() * osGridSquares.length)];
  
  // Generate random 4 numbers for OS sheet reference
  const sheetNumbers = Math.floor(1000 + Math.random() * 9000);
  
  // Generate random 4 numbers for National Grid field number
  const fieldNumbers = Math.floor(1000 + Math.random() * 9000);
  
  // Combine: XX#### #### (e.g., "NY7117 9787")
  return `${letters}${sheetNumbers} ${fieldNumbers}`;
}
  
  if (country == "no-parcel-id") {
    // Initialize the parcels array if it doesn't exist
    if (!req.session.data['parcels']) {
      req.session.data['parcels'] = [];
    }
    
    // Create dummy estimated parcel ID
    //const estimatedParcelId = 'EST' + Date.now();

    // Create realistic estimated parcel ID
    const estimatedParcelId = generateEstimatedParcelId();
    
    const newParcel = {
      id: estimatedParcelId,
      registeredDate: 'today',
      isEstimated: true,
      bounds: req.session.data['parcel-bounds']
    };
    
    req.session.data['parcels'].push(newParcel);
    req.session.data['parcel-id'] = estimatedParcelId;
    console.log('Added estimated parcel. Total parcels:', req.session.data['parcels'].length);
    
    res.redirect("upload-land-parcel-map")
  } else if (country == "found-parcel-id") {
    // Initialize the parcels array if it doesn't exist
    if (!req.session.data['parcels']) {
      req.session.data['parcels'] = [];
    }
    
    const parcelId = req.session.data['parcel-id'];
    const parcelBounds = req.session.data['parcel-bounds'];
    
    const newParcel = {
      id: parcelId,
      registeredDate: 'today',
      isEstimated: false,
      bounds: parcelBounds
    };
    
    req.session.data['parcels'].push(newParcel);
    console.log('Added found parcel. Total parcels:', req.session.data['parcels'].length);
    
    res.redirect("date-to-link-parcel-to-business")
  } else if (country == "changes-to-found-parcel") {
    // Initialize the parcels array if it doesn't exist
    if (!req.session.data['parcels']) {
      req.session.data['parcels'] = [];
    }
    
    // Add the found parcel but mark it as needing changes
    const parcelId = req.session.data['parcel-id'];
    const parcelBounds = req.session.data['parcel-bounds'];
    
    const newParcel = {
      id: parcelId,
      registeredDate: 'today',
      isEstimated: false,
      needsChanges: true, // Flag to indicate user wants to upload their own map
      bounds: parcelBounds
    };
    
    req.session.data['parcels'].push(newParcel);
    console.log('Added parcel with changes needed. Total parcels:', req.session.data['parcels'].length);
    
    res.redirect("upload-land-parcel-map")
  } else {
    res.redirect("estimate-land-parcel")
  }
});

// // Upload land parcel map
// router.post("/register-land-v3/upload-land-parcel-map", function (req, res) {
//   res.redirect("date-to-link-parcel-to-business");
// });

// Upload land parcel map
router.post("/register-land-v3/upload-land-parcel-map", function (req, res) {
  const parcelId = req.session.data['parcel-id'];
  const fileUpload = req.session.data['fileUpload'];
  
  // Find the parcel in the array and update it with the file upload
  if (req.session.data['parcels'] && parcelId) {
    const parcelIndex = req.session.data['parcels'].findIndex(p => p.id === parcelId);
    
    if (parcelIndex !== -1) {
      req.session.data['parcels'][parcelIndex].fileUpload = fileUpload;
      console.log('Added file upload to parcel:', parcelId);
    }
  }
  
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