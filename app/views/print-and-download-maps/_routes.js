//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const tableData = require('../../data/parcels.json');

// Add your routes here

// What type of map
router.post("/print-and-download-maps/what-maps", function (req, res) {
  if (req.session.data["whatMaps"] == "whole-holding") {
    res.redirect("information-to-display-on-maps");
  } else {
    res.redirect("select-land-parcels-to-print");
  }
});

// Load parcel id data
router.get("/print-and-download-maps/select-land-parcels-to-print", function (req, res) {
  res.render("print-and-download-maps/select-land-parcels-to-print", {
    tableData: tableData
  });
});

// Handle parcel selection
router.post("/print-and-download-maps/select-land-parcels-to-print", function (req, res) {
  const selectedParcels = req.body.parcels;
  
  if (!selectedParcels) {
    return res.redirect("select-land-parcels-to-print");
  }
  
  const parcelIds = Array.isArray(selectedParcels) ? selectedParcels : [selectedParcels];
  
  const selectedParcelDetails = tableData.rows.filter(row => 
    parcelIds.includes(row.parcelId)
  );
  
  req.session.data.selectedParcels = selectedParcelDetails;
  
  res.redirect("information-to-display-on-maps");
});

// Print or download maps

router.post("/print-and-download-maps/information-to-display-on-maps", function (req, res) {
  res.redirect("download-maps");
});

router.get("/print-and-download-maps/download-maps", function (req, res) {
  const selectedParcels = req.session.data.selectedParcels;
  
  res.render("print-and-download-maps/download-maps", {
    selectedParcels: selectedParcels
  });
});

module.exports = router;