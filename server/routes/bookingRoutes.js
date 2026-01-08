const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createBooking,
  cancelBooking,
  getMyBookings,
  completeBooking,
} = require("../controllers/bookingController");

// ROUTES
router.post("/", auth, createBooking);
router.get("/my", auth, getMyBookings);
router.put("/:id/cancel", auth, cancelBooking);
router.patch("/:id/complete", auth, completeBooking);

module.exports = router;
