const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  preparePayment,
  createRazorpayOrder,
  verifyPayment,
  getMyPayments,
  getAllPaymentsAdmin,
} = require("../controllers/paymentController");

router.post("/prepare", auth, preparePayment);
router.post("/create-order", auth, createRazorpayOrder);
router.post("/verify", auth, verifyPayment);

router.get("/my", auth, getMyPayments);
router.get("/admin", auth, getAllPaymentsAdmin);

module.exports = router;
