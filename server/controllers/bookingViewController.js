const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

//  ADMIN – View all bookings
exports.getAllBookingsAdmin = async (req, res) => {
  try {

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { search, status, startDate, endDate } = req.query;

    const query = {};

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
      .populate("renter", "name email role")
      .sort({ createdAt: -1 });

    // Search by vehicle make / model
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
    console.error("Admin bookings error:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// OWNER – View bookings for own vehicles
exports.getOwnerBookings = async (req, res) => {
  try {
  
    if (req.user.role !== "OWNER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { search, status } = req.query;

    const vehicles = await Vehicle.find({ ownerId: req.user.id }).select("_id");
    const vehicleIds = vehicles.map((v) => v._id);

    const query = {
      vehicle: { $in: vehicleIds },
    };

    if (status) {
      query.status = status;
    }

    let bookings = await Booking.find(query)
      .populate("vehicle")
      .populate("renter", "name email role")
      .sort({ createdAt: -1 });

    // Search by vehicle make / model
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
    console.error("Owner bookings error:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};
