const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createBooking,
  cancelBooking,
  getMyBookings,
  completeBooking,
  getVehicleBookedDates,
} = require("../controllers/bookingController");

// ROUTES
router.post("/", auth, createBooking);
router.get("/my", auth, getMyBookings);
router.put("/:id/cancel", auth, cancelBooking);
router.patch("/:id/complete", auth, completeBooking);
router.get("/vehicle/:vehicleId", getVehicleBookedDates);


module.exports = router;
