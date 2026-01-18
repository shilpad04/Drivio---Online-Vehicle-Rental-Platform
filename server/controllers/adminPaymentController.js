const Razorpay = require("razorpay");
const Payment = require("../models/Payment");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ADMIN – RAZORPAY REFUND
exports.refundPaymentByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status !== "REFUND_PENDING") {
      return res.status(400).json({
        message: "Payment is not in REFUND_PENDING state",
        status: payment.status,
      });
    }

    if (!payment.razorpayPaymentId) {
      return res.status(400).json({
        message: "razorpayPaymentId missing – refund impossible",
      });
    }

    
    console.log("========== RAZORPAY REFUND DEBUG ==========");
    console.log("DB Payment ID:", payment._id.toString());
    console.log("Razorpay Payment ID:", payment.razorpayPaymentId);
    console.log("Amount (₹):", payment.amount);
    console.log("Amount (paise):", payment.amount * 100);
    console.log("Current Status:", payment.status);
    console.log("==========================================");

    const refund = await razorpay.payments.refund(
      payment.razorpayPaymentId,
      {
        amount: payment.amount * 100, 
      }
    );

    console.log("Razorpay refund success:", refund.id);

    payment.status = "REFUNDED";
    payment.razorpayRefundId = refund.id;
    payment.refundedAt = new Date();
    payment.refundedBy = req.user.id;

    await payment.save();

    return res.json({
      message: "Refund processed successfully",
      refundId: refund.id,
    });
  } catch (error) {
    console.error("Razorpay refund FAILED");

    console.error({
      message: error.message,
      razorpayError: error.error,
      description: error.error?.description,
      reason: error.error?.reason,
      source: error.error?.source,
      step: error.error?.step,
    });

    return res.status(500).json({
      message:
        error.error?.description ||
        "Razorpay refund failed",
    });
  }
};
