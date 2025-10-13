//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here


// Do you know the Parcel ID?

router.post("/register-land-v2/know-parcel-id", function (req, res) {
  if (req.session.data["knowParcelID"] == "yes") {
    res.redirect("enter-parcel-id");
  } else {
    res.redirect("find-parcel-id");
  }
});

// Enter the Parcel ID 

router.post("/register-land-v2/enter-parcel-id", function (req, res) {
  if (req.session.data["parcelID"] == "TL4257 0684") {
    res.redirect("parcel-is-registered");
  }
    else if (req.session.data["parcelID"] == "CS0771 7013") {
    res.redirect("parcel-is-new");
    }
    else {
    res.redirect("parcel-is-not-registered");
  }
});

// If land parcel is registered

router.post("/register-land-v2/parcel-is-registered", function (req, res) {
  res.redirect("date-to-link-parcel-to-business");
});

router.post("/register-land-v2/date-to-link-parcel-to-business", function (req, res) {

  // let parcel = {
  //   'registered': req.session.data['parcelRegistered'],
  //   'know': req.session.data['knowParcelID'],
  //   'id': req.session.data['parcelID'],
  //   'map': req.session.data['fileUpload'],
  //   'day': req.session.data['date-to-link-day'],
  //   'month': req.session.data['date-to-link-month'],
  //   'year': req.session.data['date-to-link-year']
  // }

  // // set up an empty array in case the parcel choices object doesn't exist yet

  // let currentParcelChoices = []
  // if (req.session.data['parcel-choices']) {
  //   currentParcelChoices = req.session.data['parcel-choices']
  // }

  // currentParcelChoices.push(parcel)

  // // update the parcel choices in the session data
  // req.session.data['parcel-choices'] = currentParcelChoices

  // Create a new parcel object from current form data
let parcel = {
  'registered': req.session.data['parcelRegistered'],
  'know': req.session.data['knowParcelID'],
  'id': req.session.data['parcelID'],
  'map': req.session.data['fileUpload'],
  'day': req.session.data['date-to-link-day'],
  'month': req.session.data['date-to-link-month'],
  'year': req.session.data['date-to-link-year']
}

// Initialize and update the parcel choices array
req.session.data['parcel-choices'] = req.session.data['parcel-choices'] || []
req.session.data['parcel-choices'].push(parcel)

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

// If parcel not send to map to estimate parcel ID

router.post("/register-land-v2/parcel-is-not-registered", function (req, res) {
  res.redirect("find-parcel-id");
});

// When map uploaded send to date to link parcel to business

router.post("/register-land-v2/upload-land-parcel-map", function (req, res) {
  res.redirect("date-to-link-parcel-to-business");
});

// If parcel is new send to map to find parcel ID

router.post("/register-land-v2/parcel-is-new", function (req, res) {
  res.redirect("find-parcel-id");
});

// If parcel is new and already registered send to add date to link, if parcel is not registered send to map upload

router.post("/register-land-v2/find-parcel-id", function (req, res) {
  if (req.session.data["parcelID"] == "CS0771 7013") {
    res.redirect("parcel-is-registered");
  } else {
    res.redirect("upload-land-parcel-map");
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
})




// Known land parcel - TL4257 0684
// Register new land parcel - CS0771 7013
// Land parcel not registered - RD6920 2871

// Code for add to list
// router.post('/credits-add-more', function (req, res) {
  
//   let credit = {
//     'type': req.session.data['credits-type'],
//     'tier': req.session.data['credits-tier'],
//     'distinctiveness': req.session.data['credits-distinctiveness'],
//     'broad': req.session.data['credits-broad-habitat-type'],
//     'habitat': req.session.data['credits-habitat-type'],
//     'number': req.session.data['credits-number']
//   }

//   // set up an empty array in case the credit choices object doesn't exist yet
//   let currentCreditChoices = []
//   if (req.session.data['credit-choices']) {
//     currentCreditChoices = req.session.data['credit-choices']
//   }

//   currentCreditChoices.push(credit)

//   // update the credit choices in the session data
//   req.session.data['credit-choices'] = currentCreditChoices
//   console.log('CreditChoices Array ' + JSON.stringify(req.session.data['credit-choices']))
  
//   if (req.session.data['add-more-credits'] == 'yes') {
//     //req.session.data = {}
//     res.redirect('credits-type');
    
//   }
//   else if (req.session.data['add-more-credits'] == 'no') {
//     res.redirect('credits-estimated-cost');
//   }
// });

module.exports = router;