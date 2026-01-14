const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
} = require("../controllers/adminUserController");

router.get("/users", auth, getAllUsers);
router.get("/users/:id", auth, getUserDetails);
router.put("/users/:id", auth, updateUser);
router.delete("/users/:id", auth, deleteUser);

module.exports = router;
