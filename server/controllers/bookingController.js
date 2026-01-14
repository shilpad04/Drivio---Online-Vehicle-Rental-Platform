const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");

const {
  sendBookingCancellationEmail,
  sendBookingCompletionEmail,
  sendReviewReminderEmail,
} = require("../services/emailService");

const autoCompleteExpiredBookings = require("../utils/autoCompleteExpiredBookings");

// CREATE BOOKING (DISABLED)
exports.createBooking = async (req, res) => {
  return res.status(410).json({
    message: "Direct booking is disabled",
  });
};

// CANCEL BOOKING
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

// COMPLETE BOOKING (ADMIN)
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

// RENTER – GET MY BOOKINGS
exports.getMyBookings = async (req, res) => {
  try {
    await autoCompleteExpiredBookings();

    if (req.user.role !== "RENTER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { search, status, startDate, endDate } = req.query;

    const query = {
      renter: req.user.id,
    };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    let bookings = await Booking.find(query)
      .populate("vehicle")
      .sort({ createdAt: -1 });

    if (search) {
      const keyword = search.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          b.vehicle &&
          (b.vehicle.make.toLowerCase().includes(keyword) ||
            b.vehicle.model.toLowerCase().includes(keyword))
      );
    }

    res.json(bookings);
  } catch (error) {
    console.error("Get my bookings error:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// OWNER – GET BOOKINGS FOR MY VEHICLES (NO PAYMENT LOGIC)
exports.getOwnerBookings = async (req, res) => {
  try {
    await autoCompleteExpiredBookings();

    if (req.user.role !== "OWNER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { search } = req.query;

    const vehicles = await Vehicle.find({ owner: req.user.id }).select("_id");
    const vehicleIds = vehicles.map((v) => v._id);

    let bookings = await Booking.find({
      vehicle: { $in: vehicleIds },
    })
      .populate("vehicle")
      .populate("renter", "name email")
      .sort({ createdAt: -1 });

    if (search) {
      const keyword = search.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          b.vehicle &&
          (b.vehicle.make.toLowerCase().includes(keyword) ||
            b.vehicle.model.toLowerCase().includes(keyword))
      );
    }

    res.json(bookings);
  } catch (error) {
    console.error("Get owner bookings error:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};
