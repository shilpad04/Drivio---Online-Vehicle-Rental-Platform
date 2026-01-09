const Booking = require("../models/Booking");

//AUTO-COMPLETE EXPIRED BOOKINGS
const completeExpiredBookings = async () => {
  await Booking.updateMany(
    {
      status: "ACTIVE",
      endDate: { $lt: new Date() },
    },
    { status: "COMPLETED" }
  );
};

// RENTER: Get my completed rental history
exports.getRenterHistory = async (req, res) => {
  try {
    await completeExpiredBookings();

    const { search, startDate, endDate } = req.query;

    const query = {
      renter: req.user.id,
      status: "COMPLETED",
    };

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    let bookings = await Booking.find(query).populate("vehicle");

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

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Renter history error:", error);
    res.status(500).json({ message: "Failed to fetch rental history" });
  }
};

// OWNER: Get completed rentals for my vehicles
exports.getOwnerHistory = async (req, res) => {
  try {
    // auto-complete expired bookings
    await completeExpiredBookings();

    const { search, startDate, endDate } = req.query;

    const bookings = await Booking.find({
      status: "COMPLETED",
    })
      .populate({
        path: "vehicle",
        match: { ownerId: req.user.id },
      })
      .populate({
        path: "renter",
        select: "-password",
      });

  
    let filteredBookings = bookings.filter(
      (booking) => booking.vehicle !== null
    );

    if (startDate || endDate) {
      filteredBookings = filteredBookings.filter((b) => {
        const start = new Date(b.startDate);
        if (startDate && start < new Date(startDate)) return false;
        if (endDate && start > new Date(endDate)) return false;
        return true;
      });
    }

    // Search by vehicle make / model
    if (search) {
      const keyword = search.toLowerCase();
      filteredBookings = filteredBookings.filter(
        (b) =>
          b.vehicle &&
          (b.vehicle.make.toLowerCase().includes(keyword) ||
            b.vehicle.model.toLowerCase().includes(keyword))
      );
    }

    res.status(200).json(filteredBookings);
  } catch (error) {
    console.error("Owner history error:", error);
    res.status(500).json({ message: "Failed to fetch owner rental history" });
  }
};

// ADMIN: Get all completed rental history
exports.getAdminHistory = async (req, res) => {
  try {
    await completeExpiredBookings();

    const { search, startDate, endDate } = req.query;

    const query = {
      status: "COMPLETED",
    };

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    let bookings = await Booking.find(query)
      .populate("vehicle")
      .populate({
        path: "renter",
        select: "-password",
      });

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

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Admin history error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch platform rental history" });
  }
};
