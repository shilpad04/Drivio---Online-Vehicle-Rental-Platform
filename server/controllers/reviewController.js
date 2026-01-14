const Review = require("../models/Review");
const Booking = require("../models/Booking");

// ADD REVIEW (RENTER ONLY)
exports.addReview = async (req, res) => {
  try {
    if (req.user.role !== "RENTER") {
      return res.status(403).json({ message: "Only renters can add reviews" });
    }

    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({
        message: "bookingId and rating are required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const bookingRenterId =
      booking.renter && booking.renter._id
        ? booking.renter._id.toString()
        : booking.renter
        ? booking.renter.toString()
        : null;

    const userId =
      req.user._id?.toString() ||
      req.user.id?.toString() ||
      null;

    if (!bookingRenterId || !userId || bookingRenterId !== userId) {
      return res.status(403).json({
        message: "You can review only your own booking",
      });
    }

    if (booking.status !== "COMPLETED") {
      return res.status(400).json({
        message: "Review allowed only after booking completion",
      });
    }

    const existingReview = await Review.findOne({ bookingId });

    if (existingReview) {
      return res.status(400).json({
        message: "Review already submitted for this booking",
      });
    }

    const vehicleId =
      booking.vehicle && booking.vehicle._id
        ? booking.vehicle._id
        : booking.vehicle;

    const review = await Review.create({
      vehicleId,
      renterId: userId,
      bookingId,
      rating,
      comment,
    });

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET REVIEWS FOR A VEHICLE 
exports.getVehicleReviews = async (req, res) => {
  try {
    const { minRating, search } = req.query;

    const query = {
      vehicleId: req.params.vehicleId,
    };

    query.isHidden = { $ne: true };

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (search) {
      query.comment = { $regex: search, $options: "i" };
    }

    const reviews = await Review.find(query)
      .populate("renterId", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: GET ALL REVIEWS 
exports.getAllReviewsForAdmin = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const reviews = await Review.find()
      .populate("renterId", "name email")
      .populate({
        path: "vehicleId",
        populate: {
          path: "ownerId",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ADMIN — hide review 
exports.hideReview = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.isHidden = true;
    await review.save();

    res.json({ message: "Review hidden successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN — unhide review
exports.unhideReview = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.isHidden = false;
    await review.save();

    res.json({ message: "Review unhidden successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN — delete review 
exports.deleteReview = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
