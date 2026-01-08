const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  createInquiry,
  getMyInquiries,
  getAllInquiriesAdmin,
  replyToInquiry,
  closeInquiry,
} = require("../controllers/inquiryController");

// USER – submit inquiry
router.post("/", auth, createInquiry);

// USER – view own inquiries
router.get("/my", auth, getMyInquiries);

// ADMIN – view all inquiries
router.get("/admin", auth, getAllInquiriesAdmin);

// ADMIN – reply to inquiry
router.post("/:id/reply", auth, replyToInquiry);

// ADMIN – close inquiry
router.patch("/:id/close", auth, closeInquiry);

module.exports = router;
