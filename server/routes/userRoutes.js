const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  getProfile,
  updateProfile,
  deleteProfile,
} = require("../controllers/userController");

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.delete("/profile", auth, deleteProfile);

module.exports = router;
