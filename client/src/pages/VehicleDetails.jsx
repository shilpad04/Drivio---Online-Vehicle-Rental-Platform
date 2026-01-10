import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Reviews from "../components/Reviews";
import AuthModal from "../components/AuthModal";
import ConfirmModal from "../components/ConfirmModal";
import StatusBadge from "../components/StatusBadge";

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  // Booking states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  const [showAuth, setShowAuth] = useState(false);

  // Confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);

  const isAdmin = user?.role === "ADMIN";
  const isOwner = user?.role === "OWNER";
  const isRenter = user?.role === "RENTER";
  const isGuest = !user;

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        let found;

        if (isAdmin) {
          const res = await api.get("/vehicles/admin/all");
          found = res.data.find((v) => v._id === id);
        } else if (isOwner) {
          const res = await api.get("/vehicles/my");
          found = res.data.find((v) => v._id === id);
        } else {
          const res = await api.get(`/vehicles/${id}`);
          found = res.data;
        }

        if (!found) {
          navigate("/vehicles");
          return;
        }

        setVehicle(found);
      } catch {
        navigate("/vehicles");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id, isAdmin, isOwner, navigate]);

  useEffect(() => {
    setIsAvailable(false);
    setAvailabilityError("");
  }, [startDate, endDate]);

  //  ADMIN ACTIONS
  const approveVehicle = async () => {
    try {
      setActionLoading(true);
      const res = await api.put(`/vehicles/${vehicle._id}/approve`);
      setVehicle(res.data);
    } finally {
      setActionLoading(false);
      setConfirmOpen(false);
    }
  };

  const rejectVehicle = async () => {
    try {
      setActionLoading(true);
      const res = await api.put(`/vehicles/${vehicle._id}/reject`);
      setVehicle(res.data);
    } finally {
      setActionLoading(false);
      setConfirmOpen(false);
    }
  };

  // CHECK AVAILABILITY
  const checkAvailability = async () => {
    if (!startDate || !endDate) {
      setAvailabilityError("Please select both start and end dates");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setAvailabilityError("Start date cannot be in the past");
      return;
    }

    if (start >= end) {
      setAvailabilityError("End date must be after start date");
      return;
    }

    try {
      setCheckingAvailability(true);
      setAvailabilityError("");
      setIsAvailable(false);

      await api.post("/payments/prepare", {
        vehicleId: vehicle._id,
        startDate,
        endDate,
      });

      setIsAvailable(true);
    } catch (err) {
      setAvailabilityError(
        err.response?.data?.message ||
          "Vehicle not available for selected dates"
      );
    } finally {
      setCheckingAvailability(false);
    }
  };

  // BOOK NOW
  const handleBookNow = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (!isAvailable) return;

    navigate(`/vehicles/${vehicle._id}/availability`, {
      state: { startDate, endDate },
    });
  };

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  }

  if (!vehicle) return null;

  const images = vehicle.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % images.length);

  const prevImage = () =>
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );

  return (
    <>
      <div className="min-h-screen pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
        >
          ← Back
        </button>

        {/* STATUS */}
        <div className="mb-4">
          <span className="text-sm font-medium mr-2">Status:</span>
          <StatusBadge status={vehicle.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* IMAGES */}
          <div className="relative bg-gray-100 rounded-xl h-80 overflow-hidden">
            {hasMultipleImages && (
              <>
                <img
                  src={images[currentImageIndex]}
                  className="w-full h-full object-cover"
                  alt=""
                />
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* DETAILS */}
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {vehicle.make} {vehicle.model}
            </h1>

            <p className="text-gray-600 mb-4">
              {vehicle.location} • {vehicle.category}
            </p>

            <div className="text-2xl font-semibold text-blue-600 mb-6">
              ₹{vehicle.pricePerDay} / day
            </div>

            <div className="mb-6 border rounded-lg p-5 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">
                Vehicle Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <p>
                  <span className="font-medium">Vehicle Type:</span>{" "}
                  {vehicle.vehicleType}
                </p>

                <p>
                  <span className="font-medium">Year:</span>{" "}
                  {vehicle.year}
                </p>

                {/* ✅ ADDED */}
                <p>
                  <span className="font-medium">Fuel Type:</span>{" "}
                  {vehicle.fuelType}
                </p>

                {/* ✅ ADDED */}
                <p>
                  <span className="font-medium">
                    Kilometers Driven:
                  </span>{" "}
                  {vehicle.kilometersDriven?.toLocaleString()} km
                </p>
              </div>
            </div>

            {vehicle.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  Description
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {vehicle.description}
                </p>
              </div>
            )}

            {/* ADMIN */}
            {isAdmin && vehicle.status === "pending" && (
              <div className="mb-6 flex gap-3">
                <button
                  onClick={() => {
                    setConfirmType("approve");
                    setConfirmOpen(true);
                  }}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-green-600 text-white rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => {
                    setConfirmType("reject");
                    setConfirmOpen(true);
                  }}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-red-600 text-white rounded"
                >
                  Reject
                </button>
              </div>
            )}

            {/* GUEST */}
            {vehicle.status === "approved" && isGuest && (
              <button
                onClick={handleBookNow}
                className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white"
              >
                Book Now
              </button>
            )}

            {/* RENTER */}
            {vehicle.status === "approved" && isRenter && (
              <div className="space-y-3 mb-6">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  className="w-full border rounded px-3 py-2"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                  className="w-full border rounded px-3 py-2"
                />

                <button
                  onClick={checkAvailability}
                  disabled={checkingAvailability}
                  className="w-full px-4 py-2 rounded bg-gray-900 text-white"
                >
                  {checkingAvailability
                    ? "Checking..."
                    : "Check Availability"}
                </button>

                {availabilityError && (
                  <p className="text-red-600 text-sm">
                    {availabilityError}
                  </p>
                )}

                {isAvailable && (
                  <p className="text-green-600 text-sm font-medium">
                    Vehicle available
                  </p>
                )}

                <button
                  onClick={handleBookNow}
                  disabled={!isAvailable}
                  className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                >
                  Book Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* REVIEWS */}
        <div className="mt-14">
          <Reviews vehicleId={vehicle._id} />
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={confirmOpen}
        title={
          confirmType === "approve"
            ? "Approve Vehicle"
            : "Reject Vehicle"
        }
        confirmText={
          confirmType === "approve" ? "Approve" : "Reject"
        }
        loading={actionLoading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={
          confirmType === "approve"
            ? approveVehicle
            : rejectVehicle
        }
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        defaultTab="login"
      />
    </>
  );
}
