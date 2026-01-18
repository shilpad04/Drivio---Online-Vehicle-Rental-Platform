import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ConfirmModal from "./ConfirmModal";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../utils/formatDate";

export default function BookingCard({ booking, role, refresh, amountPaid }) {
  const { vehicle, renter, startDate, endDate, status, _id } = booking;

  // ✅ Added (safe, no behavior change)
  const owner = vehicle?.ownerId;

  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);

  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookingStart = new Date(startDate);
  bookingStart.setHours(0, 0, 0, 0);

  const hasStarted = today >= bookingStart;

  const confirmCancel = async () => {
    try {
      setCancelling(true);
      await api.put(`/bookings/${_id}/cancel`);
      setShowCancelModal(false);
      refresh();
    } finally {
      setCancelling(false);
    }
  };

  const confirmModify = async () => {
    try {
      setCancelling(true);
      await api.put(`/bookings/${_id}/cancel`);
      setShowModifyModal(false);
      navigate(`/vehicles/${vehicle._id}`);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <div
        onClick={() => setOpen(!open)}
        className="bg-white rounded-xl shadow cursor-pointer"
      >
        <div className="p-5 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-60 aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
            {vehicle?.images?.[0] ? (
              <img
                src={vehicle.images[0]}
                className="w-full h-full object-cover"
                alt=""
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-lg font-semibold">
              {vehicle?.make} {vehicle?.model}
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              {formatDate(startDate)} → {formatDate(endDate)}
            </p>

            <div className="mt-3">
              <StatusBadge status={status} />
            </div>

            <p className="text-sm text-blue-600 mt-3">
              {open ? "Hide details ▲" : "View details ▼"}
            </p>
          </div>
        </div>

        {open && (
          <div className="border-t bg-gray-50 px-6 py-5 space-y-3 text-sm">
            {vehicle?.location && (
              <p>
                <strong>Location:</strong> {vehicle.location}
              </p>
            )}

            {vehicle?.category && (
              <p>
                <strong>Category:</strong> {vehicle.category}
              </p>
            )}

            {vehicle?.fuelType && (
              <p>
                <strong>Fuel Type:</strong> {vehicle.fuelType}
              </p>
            )}

            {vehicle?.kilometersDriven !== undefined && (
              <p>
                <strong>Kilometers Driven:</strong>{" "}
                {vehicle.kilometersDriven.toLocaleString()} km
              </p>
            )}

            {/* ✅ Added: Owner details for RENTER */}
            {role === "RENTER" && owner && (
              <div className="pt-3 border-t">
                <p className="font-medium mb-1">Owner Details</p>
                <p>Name: {owner.name}</p>
                <p className="break-all">Email: {owner.email}</p>
              </div>
            )}

            {(role === "OWNER" || role === "ADMIN") && renter && (
              <div className="pt-3 border-t">
                <p className="font-medium mb-1">Renter Details</p>
                <p>Name: {renter.name}</p>
                <p className="break-all">Email: {renter.email}</p>

                {amountPaid !== undefined && (
                  <p className="mt-2 font-semibold text-green-700">
                    Amount Paid: ₹{amountPaid.toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {role === "RENTER" && status === "ACTIVE" && (
              <div className="pt-4 border-t flex gap-3">
                <button
                  disabled={hasStarted}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowModifyModal(true);
                  }}
                  className={`px-4 py-2 rounded-lg text-white ${
                    hasStarted
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600"
                  }`}
                >
                  Modify Booking
                </button>

                <button
                  disabled={hasStarted}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCancelModal(true);
                  }}
                  className={`px-4 py-2 rounded-lg text-white ${
                    hasStarted ? "bg-gray-400 cursor-not-allowed" : "bg-red-600"
                  }`}
                >
                  Cancel Booking
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={showCancelModal}
        title="Cancel booking?"
        description={
          <div className="space-y-3">
            <p>This booking will be cancelled and cannot be undone.</p>

            <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md text-sm font-medium">
              Amount will be refunded in 5–6 business days
            </div>
          </div>
        }
        confirmText="Yes, Cancel"
        danger
        loading={cancelling}
        onCancel={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
      />

      <ConfirmModal
        open={showModifyModal}
        title="Modify booking?"
        description={
          <div className="space-y-1.5">
            <p>
              Modifying this booking will cancel the current reservation so you
              can make changes.
            </p>

            <p className="text-xs text-gray-400">
              Payment details may update during rebooking.
            </p>
          </div>
        }
        confirmText="Yes, Continue"
        loading={cancelling}
        onCancel={() => setShowModifyModal(false)}
        onConfirm={confirmModify}
      />
    </>
  );
}
