const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

//  ADMIN ANALYTICS
exports.adminOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: "ADMIN" });
    const ownerCount = await User.countDocuments({ role: "OWNER" });
    const renterCount = await User.countDocuments({ role: "RENTER" });

    const totalVehicles = await Vehicle.countDocuments();
    const approvedVehicles = await Vehicle.countDocuments({ status: "approved" });
    const pendingVehicles = await Vehicle.countDocuments({ status: "pending" });
    const rejectedVehicles = await Vehicle.countDocuments({ status: "rejected" });

    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: "ACTIVE" });
    const cancelledBookings = await Booking.countDocuments({ status: "CANCELLED" });
    const completedBookings = await Booking.countDocuments({ status: "COMPLETED" });

    res.json({
      users: {
        total: totalUsers,
        admins: adminCount,
        owners: ownerCount,
        renters: renterCount,
      },
      vehicles: {
        total: totalVehicles,
        approved: approvedVehicles,
        pending: pendingVehicles,
        rejected: rejectedVehicles,
      },
      bookings: {
        total: totalBookings,
        active: activeBookings,
        cancelled: cancelledBookings,
        completed: completedBookings,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch admin analytics",
      error: error.message,
    });
  }
};

//  OWNER ANALYTICS
exports.ownerOverview = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const totalVehicles = await Vehicle.countDocuments({ ownerId });
    const approvedVehicles = await Vehicle.countDocuments({ ownerId, status: "approved" });
    const pendingVehicles = await Vehicle.countDocuments({ ownerId, status: "pending" });
    const rejectedVehicles = await Vehicle.countDocuments({ ownerId, status: "rejected" });

    const ownerVehicles = await Vehicle.find({ ownerId }).select("_id");
    const vehicleIds = ownerVehicles.map(v => v._id);

    const totalBookings = await Booking.countDocuments({ vehicle: { $in: vehicleIds } });
    const activeBookings = await Booking.countDocuments({
      vehicle: { $in: vehicleIds },
      status: "ACTIVE",
    });
    const cancelledBookings = await Booking.countDocuments({
      vehicle: { $in: vehicleIds },
      status: "CANCELLED",
    });
    const completedBookings = await Booking.countDocuments({
      vehicle: { $in: vehicleIds },
      status: "COMPLETED",
    });

    const ratingAgg = await Review.aggregate([
      { $match: { vehicleId: { $in: vehicleIds } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const averageRating =
      ratingAgg.length > 0
        ? Number(ratingAgg[0].avgRating.toFixed(1))
        : null;

    res.json({
      vehicles: {
        total: totalVehicles,
        approved: approvedVehicles,
        pending: pendingVehicles,
        rejected: rejectedVehicles,
      },
      bookings: {
        total: totalBookings,
        active: activeBookings,
        cancelled: cancelledBookings,
        completed: completedBookings,
      },
      ratings: {
        average: averageRating,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch owner analytics",
      error: error.message,
    });
  }
};

//  RENTER ANALYTICS
exports.renterOverview = async (req, res) => {
  try {
    const renterId = req.user.id;

    const totalBookings = await Booking.countDocuments({ renter: renterId });
    const activeBookings = await Booking.countDocuments({
      renter: renterId,
      status: "ACTIVE",
    });
    const cancelledBookings = await Booking.countDocuments({
      renter: renterId,
      status: "CANCELLED",
    });
    const completedBookings = await Booking.countDocuments({
      renter: renterId,
      status: "COMPLETED",
    });

    const reviewsGiven = await Review.countDocuments({
      renterId: renterId,
    });

    res.json({
      bookings: {
        total: totalBookings,
        active: activeBookings,
        cancelled: cancelledBookings,
        completed: completedBookings,
      },
      rentals: {
        completed: completedBookings,
      },
      reviews: {
        given: reviewsGiven,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch renter analytics",
      error: error.message,
    });
  }
};
