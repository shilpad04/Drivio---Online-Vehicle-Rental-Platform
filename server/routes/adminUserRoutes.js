const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  getAllUsers,
  getUserDetails,
} = require("../controllers/adminUserController");


//ADMIN routes
router.get("/users", auth, getAllUsers);
router.get("/users/:id", auth, getUserDetails);

module.exports = router;
