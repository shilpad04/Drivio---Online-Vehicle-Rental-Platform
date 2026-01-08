const Razorpay = require("razorpay");
const crypto = require("crypto");

const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");

const {
  sendBookingConfirmationEmail,
} = require("../services/emailService");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.preparePayment = async (req, res) => {
  try {
    if (req.user.role !== "RENTER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { vehicleId, startDate, endDate } = req.body;

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.status !== "approved") {
      return res.status(400).json({ message: "Vehicle not available" });
    }

    const overlapping = await Booking.findOne({
      vehicle: vehicleId,
      status: "ACTIVE",
      startDate: { $lte: new Date(endDate) },
      endDate: { $gte: new Date(startDate) },
    });

    if (overlapping) {
      return res
        .status(400)
        .json({ message: "Vehicle already booked for selected dates" });
    }

    const days =
      (new Date(endDate) - new Date(startDate)) /
      (1000 * 60 * 60 * 24);

    const totalAmount = days * vehicle.pricePerDay;

    res.json({
      vehicleSummary: {
        id: vehicle._id,
        make: vehicle.make,
        model: vehicle.model,
      },
      startDate,
      endDate,
      days,
      pricePerDay: vehicle.pricePerDay,
      totalAmount,
    });
  } catch {
    res.status(500).json({ message: "Failed to prepare payment" });
  }
};

exports.createRazorpayOrder = async (req, res) => {
  try {
    if (req.user.role !== "RENTER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { vehicleId, amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      renter: req.user.id,
      vehicle: vehicleId,
      amount,
      razorpayOrderId: order.id,
      status: "CREATED",
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
    });
  } catch {
    res.status(500).json({ message: "Failed to create payment order" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    if (req.user.role !== "RENTER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      vehicleId,
      startDate,
      endDate,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "FAILED" }
      );

      return res.status(400).json({ message: "Payment verification failed" });
    }

    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "SUCCESS",
      }
    );

    const booking = await Booking.create({
      renter: req.user.id,
      vehicle: vehicleId,
      startDate,
      endDate,
      status: "ACTIVE",
    });

    const renter = await User.findById(req.user.id);
    const vehicle = await Vehicle.findById(vehicleId);

    sendBookingConfirmationEmail({
      to: renter.email,
      booking,
      vehicle,
    }).catch(() => {});

    res.json({
      message: "Payment verified & booking confirmed",
      booking,
    });
  } catch {
    res.status(500).json({ message: "Payment verification failed" });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    if (req.user.role !== "RENTER") {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!req.user.id) {
      return res.status(401).json({ message: "Invalid user context" });
    }

    const { status, vehicleId, startDate, endDate, search } = req.query;

    const query = {
      renter: req.user.id,
    };

    if (status) query.status = status;
    if (vehicleId) query.vehicle = vehicleId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    let payments = await Payment.find(query)
      .populate("vehicle", "make model")
      .sort({ createdAt: -1 });

    if (search) {
      payments = payments.filter(
        (p) =>
          p.razorpayOrderId?.includes(search) ||
          p.razorpayPaymentId?.includes(search)
      );
    }

    res.json(payments);
  } catch {
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};

exports.getAllPaymentsAdmin = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status, vehicleId, renterId, startDate, endDate } = req.query;

    const query = {};

    if (status) query.status = status;
    if (vehicleId) query.vehicle = vehicleId;
    if (renterId) query.renter = renterId;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate("vehicle", "make model")
      .populate("renter", "name email")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch {
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};
