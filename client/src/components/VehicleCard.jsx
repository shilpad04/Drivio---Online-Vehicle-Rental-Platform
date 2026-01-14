import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import ConfirmModal from "./ConfirmModal";
import api from "../api/axios";

export default function VehicleCard({ vehicle }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showAuth, setShowAuth] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user?.role === "OWNER";
  const showStatus = user && user.role !== "RENTER";

  const canShowBookNow =
    vehicle.status === "approved" &&
    (!user || user.role === "RENTER");

  const canDelete =
    isOwner &&
    (vehicle.status === "pending" || vehicle.status === "rejected");

  const handleCardClick = () => {
    navigate(`/vehicles/${vehicle._id}`);
  };

  const handleBookNow = (e) => {
    e.stopPropagation();

    if (!user) {
      setShowAuth(true);
      return;
    }

    navigate(`/vehicles/${vehicle._id}`);
  };

  // OWNER ACTIONS
  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/dashboard/owner/vehicles/${vehicle._id}/edit`);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/vehicles/${vehicle._id}`);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete vehicle");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="relative bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-lg transition"
      >
        {/* STATUS BADGE */}
        {showStatus && (
          <span
            className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded
              ${
                vehicle.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : vehicle.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
          >
            {vehicle.status.toUpperCase()}
          </span>
        )}

        {/* IMAGE */}
        <div className="h-40 bg-gray-200 rounded mb-4 overflow-hidden">
          {vehicle.images?.length > 0 ? (
            <img
              src={vehicle.images[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              {vehicle.vehicleType?.toUpperCase()}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <h3 className="font-semibold text-lg">
          {vehicle.make} {vehicle.model}
        </h3>

        <p className="text-sm text-gray-500">{vehicle.location}</p>

        <p className="mt-2 font-bold text-blue-600">
          ₹{vehicle.pricePerDay} / day
        </p>

        {/* RENTER ACTION */}
        {canShowBookNow && (
          <button
            onClick={handleBookNow}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Book Now
          </button>
        )}

        {/* OWNER ACTIONS*/}
        {isOwner && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleEdit}
              className="flex-1 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800"
            >
              Edit Vehicle
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canDelete) setShowDeleteConfirm(true);
              }}
              disabled={!canDelete}
              className={`flex-1 py-2 rounded-lg text-white
                ${
                  canDelete
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              title={
                !canDelete
                  ? "Approved vehicles cannot be deleted"
                  : ""
              }
            >
              Delete Vehicle
            </button>
          </div>
        )}
      </div>

      {/* DELETE CONFIRM */}
      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete vehicle?"
        description="This vehicle will be permanently deleted. This action cannot be undone."
        confirmText="Yes, Delete"
        danger
        loading={deleting}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        defaultTab="login"
      />
    </>
  );
}
