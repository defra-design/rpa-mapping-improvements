//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

router.post("/register-land-v2/parcel-registered", function (req, res) {
  if (req.session.data["parcelRegistered"] == "yes") {
    res.redirect("know-parcel-id");
  }
    if (req.session.data["parcelRegistered"] == "no") {
    res.redirect("know-parcel-id");
    }
    else if (req.session.data["parcelRegistered"] == "dont-know") {
    res.redirect("check-if-parcel-id-registered");
  }
});

// router.post("/know-parcel-id", function (req, res) {
//   if (req.session.data["knowParcelID"] == "yes") {
//     res.redirect("enter-parcel-id");
//   } else if (req.session.data["knowParcelID"] == "no") {
//     res.redirect("find-parcel-id");
//   }
// });

// router.post("/register-land-v2/know-parcel-id", function (req, res) {
//   if (req.session.data["parcelRegistered"] == "yes" && req.session.data["knowParcelID"] == "yes" || req.session.data["parcelRegistered"] == "no" && req.session.data["knowParcelID"] == "yes") {
//     res.redirect("enter-parcel-id");
//   }
//     else if (req.session.data["parcelRegistered"] == "yes" && req.session.data["knowParcelID"] == "no") {
//     res.redirect("find-parcel-id");
//   }

//     else if (req.session.data["parcelRegistered"] == "no" && req.session.data["knowParcelID"] == "no") {
//     res.redirect("estimate-parcel-id");
//   }

// });

router.post("/register-land-v2/know-parcel-id", function (req, res) {
  if (req.session.data["knowParcelID"] == "yes") {
    res.redirect("enter-parcel-id");
  } else {
    res.redirect("find-parcel-id");
  }
});

// router.post("/register-land-v2/know-parcel-id", function (req, res) {
//   if (req.session.data["parcelRegistered"] == "yes" && req.session.data["knowParcelID"] == "yes" || req.session.data["parcelRegistered"] == "no" && req.session.data["knowParcelID"] == "yes") {
//     res.redirect("enter-parcel-id");
//   }
//     // if (req.session.data["parcelRegistered"] == "no" && req.session.data["knowParcelID"] == "yes") {
//     // res.redirect("enter-parcel-id");
//     // }
//     else if (req.session.data["parcelRegistered"] == "yes" && req.session.data["knowParcelID"] == "no") {
//     res.redirect("find-parcel-id");
//   }

//     else if (req.session.data["parcelRegistered"] == "no" && req.session.data["knowParcelID"] == "no") {
//     res.redirect("estimate-parcel-id");
//   }

// });

// router.post("/enter-parcel-id", function (req, res) {
//   res.redirect("parcel-is-registered");
// });

// router.post("/enter-parcel-id", function (req, res) {
//   if (req.session.data["parcelID"] == "TL42570684") {
//     res.redirect("parcel-is-registered");
//   } else {
//     res.redirect("parcel-is-not-registered");
//   }
// });

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

router.post("/register-land-v2/parcel-is-registered", function (req, res) {
  res.redirect("date-to-link-parcel-to-business");
});

router.post("/register-land-v2/date-to-link-parcel-to-business", function (req, res) {

  let parcel = {
    'registered': req.session.data['parcelRegistered'],
    'know': req.session.data['knowParcelID'],
    'id': req.session.data['parcelID'],
    'day': req.session.data['date-to-link-day'],
    'month': req.session.data['date-to-link-month'],
    'year': req.session.data['date-to-link-year']
  }

// set up an empty array in case the credit choices object doesn't exist yet
  let currentParcelChoices = []
  if (req.session.data['parcel-choices']) {
    currentParcelChoices = req.session.data['parcel-choices']
  }

  currentParcelChoices.push(parcel)

  // update the credit choices in the session data
  req.session.data['parcel-choices'] = currentParcelChoices
  console.log('ParcelChoices Array ' + JSON.stringify(req.session.data['parcel-choices']))


  res.redirect("check-parcel-details");
});

router.post("/register-land-v2/check-parcel-details", function (req, res) {



  if (req.session.data["registerAnotherParcel"] == "yes") {
    res.redirect("parcel-registered");
  } else if (req.session.data["registerAnotherParcel"] == "no") {
    res.redirect("register-land-declaration");
  }
});

router.post("/register-land-v2/register-land-declaration", function (req, res) {
  res.redirect("register-land-confirmation");
});

router.post("/register-land-v2/parcel-is-not-registered", function (req, res) {
  res.redirect("upload-land-parcel-map");
});

router.post("/register-land-v2/upload-land-parcel-map", function (req, res) {
  res.redirect("date-to-link-parcel-to-business");
});

// router.post("/find-parcel-id", function (req, res) {
//   res.redirect("parcel-is-registered");
// });

router.post("/register-land-v2/find-parcel-id", function (req, res) {
  if (req.session.data["foundParcelID"] == "TL4257 0684") {
    res.redirect("parcel-is-registered");
  } else {
    res.redirect("parcel-is-not-registered");
  }
});

// router.post("/register-land-v2/parcel-is-new", function (req, res) {
//   res.redirect("upload-land-parcel-map");
// });

router.post("/register-land-v2/parcel-is-new", function (req, res) {
  res.redirect("find-parcel-id");
});

router.post("/register-land-v2/estimate-parcel-ID", function (req, res) {
  res.redirect("parcel-is-new");
});

router.post("/register-land-v2/check-if-parcel-id-registered", function (req, res) {
  if (req.session.data["foundParcelID"] == "TL4257 0684") {
    res.redirect("parcel-is-registered");
  } else {
    res.redirect("parcel-is-not-registered");
  }
});

// Known land parcel - TL42570684
// Register new land parcel - CS07717013
// Land parcel not registered - RD69202871


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