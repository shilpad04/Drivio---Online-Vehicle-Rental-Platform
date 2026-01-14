import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Reviews from "../components/Reviews";
import AuthModal from "../components/AuthModal";
import ConfirmModal from "../components/ConfirmModal";
import StatusBadge from "../components/StatusBadge";
import BackButton from "../components/BackButton";
import useVehicleDetails from "../hooks/useVehicleDetails";
import VehicleImageCarousel from "../components/VehicleImageCarousel";

export default function VehicleDetails() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    vehicle,
    loading,
    actionLoading,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    checkingAvailability,
    isAvailable,
    availabilityError,
    showAuth,
    setShowAuth,
    confirmOpen,
    confirmType,
    setConfirmOpen,
    setConfirmType,
    approveVehicle,
    rejectVehicle,
    checkAvailability,
    handleBookNow,
    isAdmin,
    isOwner,
    isRenter,
    isGuest,
  } = useVehicleDetails();

  if (loading) {
    return (
      <div className="min-h-screen pt-32 text-center">
        Loading...
      </div>
    );
  }

  if (!vehicle) return null;

  return (
    <>
      <div className="min-h-screen pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <BackButton />

        <div className="mb-4">
          <span className="text-sm font-medium mr-2">Status:</span>
          <StatusBadge status={vehicle.status} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <VehicleImageCarousel images={vehicle.images || []} />

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
                <p><span className="font-medium">Vehicle Type:</span> {vehicle.vehicleType}</p>
                <p><span className="font-medium">Year:</span> {vehicle.year}</p>
                <p><span className="font-medium">Fuel Type:</span> {vehicle.fuelType}</p>
                <p>
                  <span className="font-medium">Kilometers Driven:</span>{" "}
                  {vehicle.kilometersDriven?.toLocaleString()} km
                </p>
              </div>
            </div>

            {isAdmin && vehicle.ownerId && (
              <div className="mb-6 border rounded-lg p-5 bg-gray-100">
                <h3 className="text-lg font-semibold mb-3">
                  Owner Details
                </h3>

                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {vehicle.ownerId.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {vehicle.ownerId.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    Owner ID: {vehicle.ownerId._id}
                  </p>
                </div>
              </div>
            )}

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

            {vehicle.status === "approved" && isGuest && (
              <button
                onClick={handleBookNow}
                className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white"
              >
                Book Now
              </button>
            )}

            {vehicle.status === "approved" && isRenter && (
              <div className="space-y-3 mb-6">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />

                <button
                  onClick={checkAvailability}
                  disabled={checkingAvailability}
                  className="w-full px-4 py-2 rounded bg-gray-900 text-white"
                >
                  {checkingAvailability ? "Checking..." : "Check Availability"}
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

        <div className="mt-14">
          <Reviews vehicleId={vehicle._id} />
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={confirmType === "approve" ? "Approve Vehicle" : "Reject Vehicle"}
        confirmText={confirmType === "approve" ? "Approve" : "Reject"}
        loading={actionLoading}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmType === "approve" ? approveVehicle : rejectVehicle}
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        defaultTab="login"
      />
    </>
  );
}
