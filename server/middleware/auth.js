const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId =
      decoded.id ||
      decoded._id ||
      decoded.userId ||
      decoded.sub;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(userId).select(
      "_id name email role isActive"
    );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account deactivated" });
    }

    // ✅ FINAL FIX: NORMALIZE ID TO STRING
    req.user = {
      id: user._id.toString(),   // 🔑 THIS WAS THE ROOT CAUSE
      role: user.role,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Token invalid" });
  }
};
