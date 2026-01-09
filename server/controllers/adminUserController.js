const User = require("../models/User");

 // ADMIN: Get all users
 // Search + Role filter
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { search, role } = req.query;

    const query = {};

    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("name email role createdAt")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN: Get single user details
exports.getUserDetails = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id).select(
      "name email role createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
