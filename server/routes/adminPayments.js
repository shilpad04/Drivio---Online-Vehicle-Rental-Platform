const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  refundPaymentByAdmin,
} = require("../controllers/adminPaymentController");

router.post(
  "/admin/payments/:id/refund",
  auth,
  refundPaymentByAdmin
);

module.exports = router;
