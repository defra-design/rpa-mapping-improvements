//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

// Do you know the Parcel ID?
router.post("/register-land-v3/know-parcel-id", function (req, res) {
  if (req.session.data["knowParcelID"] == "yes") {
    res.redirect("confirm-land-parcel-single");
  } else {
    res.redirect("estimate-land-parcel");
  }
});

// Confirm land parcel
router.post("/register-land-v3/confirm-land-parcel-single", function (req, res) {
  res.redirect("date-to-link-parcel-to-business");
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
router.post("/register-land-v3/delete-parcel", function (req, res) {
  res.redirect("check-parcel-details");
});


// Helper function to classify parcel ID based on prefix
function classifyParcelID(parcelID) {
  if (!parcelID) return 'unknown'
  
  const prefix = parcelID.substring(0, 2).toUpperCase()
  
  if (prefix === 'TL') {
    return 'registered'
  } else if (prefix === 'CS') {
    return 'on-system-not-registered'
  } else if (prefix === 'RD') {
    return 'not-on-system'
  } else {
    return 'not-on-system' // Default for unknown prefixes
  }
}

// Smart route for editing parcel ID - determines which flow to use
router.get('/register-land-v2/edit-parcel-id', function (req, res) {
  const editIndex = req.query.editIndex
  
  if (editIndex !== undefined && req.session.data['parcel-choices']) {
    // Store that we're in edit mode
    req.session.data['editIndex'] = editIndex
    req.session.data['editMode'] = 'true'
    
    // Get the parcel we're editing
    const parcel = req.session.data['parcel-choices'][editIndex]
    
    // Store the original parcel type for comparison later
    req.session.data['originalParcelType'] = classifyParcelID(parcel.id)
    
    // Pre-populate the form fields
    req.session.data['parcelRegistered'] = parcel.registered
    req.session.data['knowParcelID'] = parcel.know
    req.session.data['parcelID'] = parcel.id
    req.session.data['fileUpload'] = parcel.map
    
    // When editing parcel ID, always go to enter-parcel-id screen
    // This is where they actually change the ID value
    res.redirect('enter-parcel-id')
  } else {
    // If no valid edit index, start from the beginning
    res.redirect('know-parcel-id')
  }
})

// Smart route for editing map - determines which flow to use
router.get('/register-land-v2/edit-map', function (req, res) {
  const editIndex = req.query.editIndex
  
  if (editIndex !== undefined && req.session.data['parcel-choices']) {
    // Store that we're in edit mode
    req.session.data['editIndex'] = editIndex
    req.session.data['editMode'] = 'true'
    
    // Get the parcel we're editing
    const parcel = req.session.data['parcel-choices'][editIndex]
    
    // Pre-populate the form fields
    req.session.data['parcelRegistered'] = parcel.registered
    req.session.data['knowParcelID'] = parcel.know
    req.session.data['parcelID'] = parcel.id
    req.session.data['fileUpload'] = parcel.map
    
    // Determine which type of parcel this is
    const parcelType = classifyParcelID(parcel.id)
    
    // Route based on parcel type
    if (parcelType === 'on-system-not-registered') {
      // CS prefix - find on map
      res.redirect('find-parcel-id')
    } else {
      // RD prefix or other - upload map
      res.redirect('upload-land-parcel-map')
    }
  } else {
    // If no valid edit index, start from the beginning
    res.redirect('know-parcel-id')
  }
})

// Pre-populate forms when editing a parcel
router.get('/register-land-v2/enter-parcel-id', function (req, res, next) {
  const editIndex = req.query.editIndex
  
  if (editIndex !== undefined && req.session.data['parcel-choices']) {
    // Store that we're in edit mode
    req.session.data['editIndex'] = editIndex
    req.session.data['editMode'] = 'true'
    
    // Get the parcel we're editing
    const parcel = req.session.data['parcel-choices'][editIndex]
    
    // Pre-populate the form fields
    req.session.data['parcelRegistered'] = parcel.registered
    req.session.data['knowParcelID'] = parcel.know
    req.session.data['parcelID'] = parcel.id
    req.session.data['fileUpload'] = parcel.map
  }
  
  next()
})

router.get('/register-land-v2/date-to-link-parcel-to-business', function (req, res, next) {
  const editIndex = req.query.editIndex
  
  if (editIndex !== undefined && req.session.data['parcel-choices']) {
    // Store that we're in edit mode
    req.session.data['editIndex'] = editIndex
    req.session.data['editMode'] = 'true'
    
    // Get the parcel we're editing
    const parcel = req.session.data['parcel-choices'][editIndex]
    
    // Pre-populate all fields
    req.session.data['parcelRegistered'] = parcel.registered
    req.session.data['knowParcelID'] = parcel.know
    req.session.data['parcelID'] = parcel.id
    req.session.data['fileUpload'] = parcel.map
    req.session.data['date-to-link-day'] = parcel.day
    req.session.data['date-to-link-month'] = parcel.month
    req.session.data['date-to-link-year'] = parcel.year
  }
  
  next()
})

// Pre-populate when editing from find-parcel-id
router.get('/register-land-v2/find-parcel-id', function (req, res, next) {
  const editIndex = req.query.editIndex
  
  if (editIndex !== undefined && req.session.data['parcel-choices']) {
    // Store that we're in edit mode
    req.session.data['editIndex'] = editIndex
    req.session.data['editMode'] = 'true'
    
    // Get the parcel we're editing
    const parcel = req.session.data['parcel-choices'][editIndex]
    
    // Pre-populate all fields
    req.session.data['parcelRegistered'] = parcel.registered
    req.session.data['knowParcelID'] = parcel.know
    req.session.data['parcelID'] = parcel.id
    req.session.data['fileUpload'] = parcel.map
  }
  
  next()
})

// Pre-populate when editing from upload-land-parcel-map
router.get('/register-land-v2/upload-land-parcel-map', function (req, res, next) {
  const editIndex = req.query.editIndex
  
  if (editIndex !== undefined && req.session.data['parcel-choices']) {
    // Store that we're in edit mode
    req.session.data['editIndex'] = editIndex
    req.session.data['editMode'] = 'true'
    
    // Get the parcel we're editing
    const parcel = req.session.data['parcel-choices'][editIndex]
    
    // Pre-populate all fields
    req.session.data['parcelRegistered'] = parcel.registered
    req.session.data['knowParcelID'] = parcel.know
    req.session.data['parcelID'] = parcel.id
    req.session.data['fileUpload'] = parcel.map
  }
  
  next()
})



// Enter the Parcel ID 

router.post("/register-land-v2/enter-parcel-id", function (req, res) {
  const editMode = req.session.data['editMode']
  const editIndex = req.session.data['editIndex']
  const parcelID = req.session.data['parcelID']
  
  // Classify the parcel based on prefix
  const parcelType = classifyParcelID(parcelID)
  
  // If in edit mode, check if parcel type has changed
  if (editMode === 'true' && editIndex !== undefined && req.session.data['parcel-choices']) {
    const originalParcelType = req.session.data['originalParcelType']
    
    // Store the original parcel ID BEFORE updating it
    const originalParcelID = req.session.data['parcel-choices'][editIndex].id
    req.session.data['originalParcelID'] = originalParcelID
    
    // Update the parcel ID
    req.session.data['parcel-choices'][editIndex].id = parcelID
    
    // Check if the parcel type has changed
    if (originalParcelType !== parcelType) {
      // Type has changed - show interstitial page
      req.session.data['newParcelType'] = parcelType
      res.redirect("parcel-type-changed")
    } else {
      // Type hasn't changed - go straight back to check details
      delete req.session.data['editMode']
      delete req.session.data['editIndex']
      delete req.session.data['originalParcelType']
      delete req.session.data['originalParcelID']
      delete req.session.data['parcelID']
      
      res.redirect("check-parcel-details")
    }
  } else {
    // Normal add flow - use prefix-based branching logic
    if (parcelType === 'registered') {
      res.redirect("parcel-is-registered")
    } else if (parcelType === 'on-system-not-registered') {
      res.redirect("parcel-is-new")
    } else {
      // not-on-system or unknown
      res.redirect("parcel-is-not-registered")
    }
  }
});

// Handle parcel type change during edit
router.post("/register-land-v2/parcel-type-changed", function (req, res) {
  const continueEdit = req.session.data['continueEdit']
  const newParcelType = req.session.data['newParcelType']
  const editIndex = req.session.data['editIndex']
  
  if (continueEdit === 'yes') {
    // User wants to continue with the change
    
    // If changing to a registered or on-system-not-registered parcel, clear the old map upload data
    // Only RD (not-on-system) parcels need uploaded maps
    if (newParcelType === 'registered' || newParcelType === 'on-system-not-registered') {
      delete req.session.data['fileUpload']
    }
    
    // Clean up the stored original parcel ID as change is confirmed
    delete req.session.data['originalParcelID']
    
    // Route them to the appropriate flow based on new parcel type
    if (newParcelType === 'registered') {
      // Registered - just needs date
      res.redirect("date-to-link-parcel-to-business")
    } else if (newParcelType === 'on-system-not-registered') {
      // On system but not registered - needs to find on map
      res.redirect("find-parcel-id")
    } else {
      // Not on system - needs to find/upload map
      res.redirect("find-parcel-id")
    }
  } else {
    // User wants to cancel - restore original ID and go back
    const originalParcelID = req.session.data['originalParcelID']
    req.session.data['parcel-choices'][editIndex].id = originalParcelID
    req.session.data['parcelID'] = originalParcelID
    
    // Clean up
    delete req.session.data['editMode']
    delete req.session.data['editIndex']
    delete req.session.data['originalParcelType']
    delete req.session.data['originalParcelID']
    delete req.session.data['newParcelType']
    delete req.session.data['continueEdit']
    delete req.session.data['parcelID']
    
    res.redirect("check-parcel-details")
  }
});

// If land parcel is registered

router.post("/register-land-v2/parcel-is-registered", function (req, res) {
  res.redirect("date-to-link-parcel-to-business");
});

router.post("/register-land-v2/date-to-link-parcel-to-business", function (req, res) {
  const editIndex = req.session.data['editIndex']
  const editMode = req.session.data['editMode']
  const parcelID = req.session.data['parcelID']
  const parcelType = classifyParcelID(parcelID)

  // Create/update the parcel object
  let parcel = {
    'registered': req.session.data['parcelRegistered'],
    'know': req.session.data['knowParcelID'],
    'id': req.session.data['parcelID'],
    'day': req.session.data['date-to-link-day'],
    'month': req.session.data['date-to-link-month'],
    'year': req.session.data['date-to-link-year']
  }
  
  // Handle map based on parcel type
  // TL (registered) parcels don't have maps - always set to empty
  // CS parcels are found on map (may have a reference)
  // RD parcels need map uploads
  if (parcelType === 'registered') {
    // Registered parcels don't have map uploads
    parcel.map = ''
  } else if (req.session.data['fileUpload']) {
    // For non-registered parcels, include map if it exists
    parcel.map = req.session.data['fileUpload']
  } else {
    parcel.map = ''
  }

  // Check if we're editing an existing parcel
  if (editMode === 'true' && editIndex !== undefined && req.session.data['parcel-choices']) {
    // Convert editIndex to a number to ensure proper array access
    const index = parseInt(editIndex, 10)
    
    // Update the existing parcel
    req.session.data['parcel-choices'][index] = parcel
    console.log('Updated parcel at index ' + index)
    
    // Clean up edit mode flags
    delete req.session.data['editIndex']
    delete req.session.data['editMode']
    delete req.session.data['originalParcelType']
    delete req.session.data['originalParcelID']
    delete req.session.data['newParcelType']
  } else {
    // Add new parcel to array
    req.session.data['parcel-choices'] = req.session.data['parcel-choices'] || []
    req.session.data['parcel-choices'].push(parcel)
    console.log('Added new parcel')
  }

  // Clean up temporary form data
  const fieldsToClean = [
    'parcelRegistered',
    'knowParcelID', 
    'parcelID',
    'fileUpload',
    'date-to-link-day',
    'date-to-link-month',
    'date-to-link-year'
  ]

  fieldsToClean.forEach(field => delete req.session.data[field])
  
  console.log('ParcelChoices Array ' + JSON.stringify(req.session.data['parcel-choices']))

  res.redirect("check-parcel-details");
});

// Ask user if they'd like add additional parcels if yes begin process of adding parcel if not send to declaration

router.post("/register-land-v2/check-parcel-details", function (req, res) {
  if (req.session.data["registerAnotherParcel"] == "yes") {
    res.redirect("know-parcel-id");
  } else if (req.session.data["registerAnotherParcel"] == "no") {
    res.redirect("register-land-declaration");
  }
});

// From declaration send to confirmation

router.post("/register-land-v2/register-land-declaration", function (req, res) {
  res.redirect("register-land-confirmation");
});

// If parcel not registered send to map to find or estimate parcel ID

router.post("/register-land-v2/parcel-is-not-registered", function (req, res) {
  res.redirect("find-parcel-id");
});

// When map uploaded send to date to link parcel to business

router.post("/register-land-v2/upload-land-parcel-map", function (req, res) {
  const editMode = req.session.data['editMode']
  const editIndex = req.session.data['editIndex']
  
  // If in edit mode, update just the map and go back to check details
  if (editMode === 'true' && editIndex !== undefined && req.session.data['parcel-choices']) {
    // Update just the map in the existing parcel
    const index = parseInt(editIndex, 10)
    req.session.data['parcel-choices'][index].map = req.session.data['fileUpload']
    
    // Clean up
    delete req.session.data['editMode']
    delete req.session.data['editIndex']
    delete req.session.data['fileUpload']
    
    res.redirect("check-parcel-details")
  } else {
    // Normal add flow
    res.redirect("date-to-link-parcel-to-business")
  }
});

// If parcel is new send to map to find parcel ID

router.post("/register-land-v2/parcel-is-new", function (req, res) {
  res.redirect("find-parcel-id");
});

// If parcel is new and already registered send to add date to link, if parcel is not registered send to map upload

router.post("/register-land-v2/find-parcel-id", function (req, res) {
  const editMode = req.session.data['editMode']
  const editIndex = req.session.data['editIndex']
  const parcelID = req.session.data["parcelID"]
  const parcelType = classifyParcelID(parcelID)
  
  // Determine where to route based on parcel type
  // CS prefix means it's on the system (found on map) - go to date
  // RD or other = not on system, needs upload
  
  if (parcelType === 'on-system-not-registered') {
    // CS parcel - found on map
    if (editMode === 'true' && editIndex !== undefined && req.session.data['parcel-choices']) {
      // In edit mode - go to date screen to complete the update
      res.redirect("date-to-link-parcel-to-business")
    } else {
      // Normal add flow
      res.redirect("date-to-link-parcel-to-business")
    }
  } else {
    // RD or other = not on system, needs upload
    // Both add and edit mode go to upload screen
    res.redirect("upload-land-parcel-map")
  }
});

// Delete land parcels from check parcel details

router.post('/register-land-v2/delete-parcel', function (req, res) {
  console.log('Confirm delete:', req.body.confirmDelete)
  console.log('Parcel index:', req.body.index)
  console.log('Parcel choices before:', req.session.data['parcel-choices'])
  
  const confirmDelete = req.body.confirmDelete
  const parcelIndex = req.body.index
  
  if (confirmDelete === 'yes' && req.session.data['parcel-choices'] && parcelIndex !== undefined) {
    req.session.data['parcel-choices'].splice(parcelIndex, 1)
    
    if (req.session.data['parcel-choices'].length === 0) {
      delete req.session.data['parcel-choices']
    }
  }
  
  console.log('Parcel choices after:', req.session.data['parcel-choices'])
  
  delete req.session.data['deleteIndex']
  delete req.session.data['confirmDelete']
  
  res.redirect('check-parcel-details')
});


module.exports = router;