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
  updateVehicle,
  deleteVehicle,
  getVehicleLocations, 
} = require("../controllers/vehicleController");

// PUBLIC
router.get("/", getApprovedVehicles);

router.get("/locations", getVehicleLocations);

// OWNER
router.post("/", auth, addVehicle);
router.get("/my", auth, getMyVehicles);

// ADMIN
router.get("/admin/all", auth, getAllVehiclesForAdmin);
router.put("/:id/approve", auth, approveVehicle);
router.put("/:id/reject", auth, rejectVehicle);

// OWNER ACTIONS
router.put("/:id", auth, updateVehicle);
router.delete("/:id", auth, deleteVehicle);

// PUBLIC 
router.get("/:id", getVehicleById);

module.exports = router;
