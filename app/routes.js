//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here

router.post("/parcel-registered", function (req, res) {
  if (req.session.data["parcelRegistered"] == "yes") {
    res.redirect("know-parcel-id");
  }
    if (req.session.data["parcelRegistered"] == "no") {
    res.redirect("know-parcel-id");
    }
    else if (req.session.data["parcelRegistered"] == "dont-know") {
    res.redirect("register-land-start");
  }
});

router.post("/know-parcel-id", function (req, res) {
  if (req.session.data["knowParcelID"] == "yes") {
    res.redirect("enter-parcel-id");
  } else if (req.session.data["knowParcelID"] == "no") {
    res.redirect("register-land-start");
  }
});

router.post("/enter-parcel-id", function (req, res) {
  res.redirect("parcel-is-registered");
});

router.post("/parcel-is-registered", function (req, res) {
  res.redirect("date-to-link-parcel-to-business");
});

router.post("/date-to-link-parcel-to-business", function (req, res) {
  res.redirect("check-parcel-details");
});

router.post("/check-parcel-details", function (req, res) {
  if (req.session.data["registerAnotherParcel"] == "yes") {
    res.redirect("parcel-registered");
  } else if (req.session.data["registerAnotherParcel"] == "no") {
    res.redirect("register-land-declaration");
  }
});

router.post("/register-land-declaration", function (req, res) {
  res.redirect("register-land-confirmation");
});