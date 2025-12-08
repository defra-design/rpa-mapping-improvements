//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()


router.post("/register-land-v3/know-parcel-id", function (req, res) {
  
  if (req.session.data["knowParcelID"] == "yes") {
    
    const userEnteredId = req.session.data['parcel-id']; // Ensure this name matches your Nunjucks input name
    
    // Add the parcel to the session array if the ID was entered
    if (userEnteredId && userEnteredId.trim() !== '') {
        // Initialize the parcels array if it doesn't exist
        if (!req.session.data['parcels']) {
          req.session.data['parcels'] = [];
        }

        // Create the new object with static prototype data
        const newParcel = {
          id: userEnteredId,
          registeredDate: 'today',
          imageUrl: '/public/images/land-parcel-CS07717013.png'
        };

        // Push the object into the array
        req.session.data['parcels'].push(newParcel);
    }
    
    // Redirect to the confirmation page (which will display the summary list)
    res.redirect("confirm-land-parcel-single");
    
  } else {
    // Redirect to the alternative journey (estimate land parcel)
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