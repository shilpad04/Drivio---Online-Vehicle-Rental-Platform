const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");

const {
  sendBookingCancellationEmail,
  sendBookingCompletionEmail,
  sendReviewReminderEmail,
} = require("../services/emailService");

const autoCompleteExpiredBookings = require("../utils/autoCompleteExpiredBookings");

exports.createBooking = async (req, res) => {
  return res.status(410).json({
    message: "Direct booking is disabled",
  });
};

exports.cancelBooking = async (req, res) => {
  try {
    if (req.user.role !== "RENTER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "Only active bookings can be cancelled" });
    }

    if (booking.renter.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    booking.status = "CANCELLED";
    await booking.save();

    const renter = await User.findById(booking.renter);
    const vehicle = await Vehicle.findById(booking.vehicle);

    sendBookingCancellationEmail({
      to: renter.email,
      booking,
      vehicle,
    }).catch(console.error);

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Cancel failed" });
  }
};

exports.completeBooking = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "COMPLETED";
    await booking.save();

    const renter = await User.findById(booking.renter);
    const vehicle = await Vehicle.findById(booking.vehicle);

    sendBookingCompletionEmail({
      to: renter.email,
      booking,
      vehicle,
    }).catch(console.error);

    sendReviewReminderEmail({
      to: renter.email,
      booking,
      vehicle,
    }).catch(console.error);

    res.json({ message: "Booking marked as completed" });
  } catch (error) {
    console.error("Complete booking error:", error);
    res.status(500).json({ message: "Completion failed" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    await autoCompleteExpiredBookings();

    if (req.user.role !== "RENTER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const bookings = await Booking.find({ renter: req.user.id })
      .populate("vehicle")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};
