const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const auth = require("../middleware/auth");

// AUTH
router.post("/register", register);
router.post("/login", login);

router.get("/me", auth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
