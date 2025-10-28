//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here


// What maps do you want to download or print?

router.post("/print-and-download-maps/what-maps", function (req, res) {
  if (req.session.data["whatMaps"] == "whole-holding") {
    res.redirect("information-to-display-on-maps");
  } else {
    res.redirect("select-land-parcels-to-print");
  }
});

// Print or download maps

router.post("/print-and-download-maps/information-to-display-on-maps", function (req, res) {
  res.redirect("print-or-download-maps");
});

module.exports = router;