const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  adminOverview,
  ownerOverview,
  renterOverview,
} = require("../controllers/analyticsController");

// ADMIN
router.get("/admin/overview", auth, (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, adminOverview);

// OWNER
router.get("/owner/overview", auth, (req, res, next) => {
  if (req.user.role !== "OWNER") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, ownerOverview);

// RENTER
router.get("/renter/overview", auth, (req, res, next) => {
  if (req.user.role !== "RENTER") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}, renterOverview);

module.exports = router;
