const Vehicle = require("../models/Vehicle");

// PUBLIC / RENTER
// Get approved vehicles with filters
exports.getApprovedVehicles = async (req, res) => {
  try {
    const {
      search,
      vehicleType,
      location,
      category,
      fuelType,
      minPrice,
      maxPrice,
    } = req.query;

    const query = { status: "approved" };

    if (search) {
      query.$or = [
        { make: new RegExp(search, "i") },
        { model: new RegExp(search, "i") },
      ];
    }

    if (vehicleType) query.vehicleType = vehicleType;
    if (category) query.category = category;
    if (fuelType) query.fuelType = fuelType;

    if (location) {
      query.location = new RegExp(`^${location}$`, "i");
    }

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

exports.getVehicleLocations = async (req, res) => {
  try {
    const locations = await Vehicle.aggregate([
      {
        $match: {
          status: "approved",
          location: { $exists: true, $ne: "" },
        },
      },
      {
        $project: {
          location: {
            $trim: { input: "$location" },
          },
        },
      },
      {
        $project: {
          normalized: {
            $concat: [
              { $toUpper: { $substrCP: ["$location", 0, 1] } },
              {
                $toLower: {
                  $substrCP: [
                    "$location",
                    1,
                    { $subtract: [{ $strLenCP: "$location" }, 1] },
                  ],
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$normalized",
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          location: "$_id",
        },
      },
    ]);

    res.json(locations.map((l) => l.location));
  } catch (error) {
    console.error("Get vehicle locations error:", error);
    res.status(500).json({ message: "Failed to fetch locations" });
  }
};

// Get single approved vehicle
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      status: "approved",
    }).populate("ownerId", "name");

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch vehicle" });
  }
};

// OWNER
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
    console.error("Add vehicle error:", error);
    res.status(500).json({ message: error.message });
  }
};

// OWNER VEHICLE SEARCH (make / model)
exports.getMyVehicles = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const query = { ownerId: req.user.id };

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { make: new RegExp(search, "i") },
        { model: new RegExp(search, "i") },
      ];
    }

    if (category) query.category = category;

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    console.error("Get my vehicles error:", error);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
};

// ADMIN
exports.getAllVehiclesForAdmin = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status, search } = req.query;
    const query = {};

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { make: new RegExp(search, "i") },
        { model: new RegExp(search, "i") },
      ];
    }

    const vehicles = await Vehicle.find(query)
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 });

    res.json(vehicles);
  } catch (error) {
    console.error("Admin vehicle fetch error:", error);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
};

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
    console.error("Approve vehicle error:", error);
    res.status(500).json({ message: error.message });
  }
};

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
    console.error("Reject vehicle error:", error);
    res.status(500).json({ message: error.message });
  }
};

// OWNER ACTIONS
exports.updateVehicle = async (req, res) => {
  try {
    if (req.user.role !== "OWNER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (vehicle.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your vehicle" });
    }

    const updates = {};

    if (
      req.body.kilometersDriven !== undefined &&
      !isNaN(req.body.kilometersDriven)
    ) {
      updates.kilometersDriven = Number(req.body.kilometersDriven);
    }

    if (vehicle.status !== "approved") {
      if (req.body.pricePerDay !== undefined && !isNaN(req.body.pricePerDay)) {
        updates.pricePerDay = Number(req.body.pricePerDay);
      }
      if (req.body.location) updates.location = req.body.location;
      if (req.body.description) updates.description = req.body.description;
      if (req.body.fuelType) updates.fuelType = req.body.fuelType;
      if (req.body.category) updates.category = req.body.category;
      if (req.body.vehicleType) updates.vehicleType = req.body.vehicleType;
    }

    if (vehicle.status === "rejected" && req.body.status === "pending") {
      updates.status = "pending";
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    Object.assign(vehicle, updates);
    await vehicle.save();

    res.json(vehicle);
  } catch (error) {
    console.error("Update vehicle error:", error);
    res.status(500).json({ message: "Failed to update vehicle" });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    if (req.user.role !== "OWNER") {
      return res.status(403).json({ message: "Access denied" });
    }

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (vehicle.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your vehicle" });
    }

    if (vehicle.status === "approved") {
      return res.status(400).json({
        message: "Approved vehicles cannot be deleted",
      });
    }

    await vehicle.deleteOne();
    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    res.status(500).json({ message: "Failed to delete vehicle" });
  }
};
