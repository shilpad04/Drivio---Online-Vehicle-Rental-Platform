const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  getAllBookingsAdmin,
  getOwnerBookings,
} = require("../controllers/bookingViewController");

// ADMIN booking view
router.get("/admin", auth, getAllBookingsAdmin);

// OWNER booking view
router.get("/owner", auth, getOwnerBookings);

module.exports = router;
