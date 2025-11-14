//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require("govuk-prototype-kit");
const router = govukPrototypeKit.requests.setupRouter();

router.use((req, res, next) => {
  res.locals.query = req.query;
  res.locals.path = req.path;

  next();
});

// Routes setup
const rl1 = require("./views/register-land-v1/_routes");
router.use("register-land-v1", rl1);

const rl2 = require("./views/register-land-v2/_routes");
router.use("register-land-v2", rl2);

const dm1 = require("./views/download-maps-v1/_routes");
router.use("download-maps", dm1);

const dm2 = require("./views/download-maps-v2/_routes");
router.use("download-maps", dm2);

const dm3 = require("./views/download-maps-v3/_routes");
router.use("download-maps", dm3);
