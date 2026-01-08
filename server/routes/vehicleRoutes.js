const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  addVehicle,
  approveVehicle,
  rejectVehicle,
  getApprovedVehicles,
  getMyVehicles,
  getVehicleById,
  getAllVehiclesForAdmin,
} = require("../controllers/vehicleController");

// =====================
// PUBLIC
// =====================
router.get("/", getApprovedVehicles);

// =====================
// ADMIN
// =====================
router.get("/admin/all", auth, getAllVehiclesForAdmin);

// =====================
// OWNER
// =====================
router.get("/my", auth, getMyVehicles);

// =====================
// PUBLIC – single approved vehicle
// =====================
router.get("/:id", getVehicleById);

// =====================
// OWNER
// =====================
router.post("/", auth, addVehicle);

// =====================
// ADMIN ACTIONS
// =====================
router.put("/:id/approve", auth, approveVehicle);
router.put("/:id/reject", auth, rejectVehicle);

module.exports = router;
