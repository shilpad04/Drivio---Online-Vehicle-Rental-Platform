const imagekit = require("../config/imagekit");

exports.getImageKitAuth = async (req, res) => {
  try {
    const result = imagekit.getAuthenticationParameters();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "ImageKit auth failed" });
  }
};
