const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  addReview,
  getVehicleReviews,
  getAllReviewsForAdmin,
  hideReview,
  unhideReview,
  deleteReview,
} = require("../controllers/reviewController");

router.post("/", auth, addReview);
router.get("/vehicle/:vehicleId", getVehicleReviews);

//Admin - routes
router.get("/admin", auth, getAllReviewsForAdmin);
router.patch("/:id/hide", auth, hideReview);
router.patch("/:id/unhide", auth, unhideReview);
router.delete("/:id", auth, deleteReview);

module.exports = router;
