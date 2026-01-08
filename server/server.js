require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const imagekitRoutes = require("./routes/imagekitRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const bookingViewRoutes = require("./routes/bookingViewRoutes");
const reviewRoutes = require("./routes/reviewRoutes"); // ✅ ONLY ONCE
const historyRoutes = require("./routes/historyRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/imagekit", imagekitRoutes);

app.use("/api/bookings", bookingRoutes);
app.use("/api/bookings/view", bookingViewRoutes);

app.use("/api/reviews", reviewRoutes); // ✅ ONLY ONCE
app.use("/api/history", historyRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use("/api/payments", paymentRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin", adminUserRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

// Server Boot
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
