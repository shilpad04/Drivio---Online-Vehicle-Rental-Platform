const Vehicle = require("../models/Vehicle");

/**
 * =====================================
 * PUBLIC / RENTER
 * Get approved vehicles with filters
 * =====================================
 */
exports.getApprovedVehicles = async (req, res) => {
  try {
    const { search, vehicleType, location, category, minPrice, maxPrice } =
      req.query;

    const query = {
      status: "approved",
    };

    // Search by make / model
    if (search) {
      query.$or = [
        { make: new RegExp(search, "i") },
        { model: new RegExp(search, "i") },
      ];
    }

    if (vehicleType) query.vehicleType = vehicleType;
    if (location) query.location = location;
    if (category) query.category = category;

    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });

    res.json(vehicles);
  } catch (error) {
    console.error("Get approved vehicles error:", error);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
};

/**
 * =====================================
 * PUBLIC / RENTER
 * Get single approved vehicle by ID
 * =====================================
 */
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      status: "approved",
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json(vehicle);
  } catch (error) {
    console.error("Get vehicle by ID error:", error);
    res.status(500).json({ message: "Failed to fetch vehicle" });
  }
};

/**
 * =====================================
 * OWNER
 * Add vehicle (pending by default)
 * =====================================
 */
exports.addVehicle = async (req, res) => {
  try {
    if (req.user.role !== "OWNER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const vehicle = await Vehicle.create({
      ...req.body,
      ownerId: req.user.id,
      status: "pending",
    });

    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * =====================================
 * OWNER
 * Get my vehicles (all statuses)
 * =====================================
 */
exports.getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ ownerId: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * =====================================
 * ADMIN
 * Get ALL vehicles (approved | pending | rejected)
 * =====================================
 */
exports.getAllVehiclesForAdmin = async (req, res) => {
  try {
    // 🔒 Strict role enforcement
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.query;

    const query = {};
    if (status) {
      query.status = status; // approved | pending | rejected
    }

    const vehicles = await Vehicle.find(query)
      .populate("ownerId", "name email role") // ✅ FIXED
      .sort({ createdAt: -1 });

    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Admin vehicle fetch error:", error);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
};

/**
 * =====================================
 * ADMIN
 * Approve vehicle
 * =====================================
 */
exports.approveVehicle = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * =====================================
 * ADMIN
 * Reject vehicle
 * =====================================
 */
exports.rejectVehicle = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
