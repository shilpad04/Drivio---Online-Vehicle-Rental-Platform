import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import ConfirmModal from "../components/ConfirmModal";
import { paginate } from "../utils/pagination";
import { exportCSV } from "../utils/exportCSV";
import StatusBadge from "../components/StatusBadge";

const ITEMS_PER_PAGE = 5;

export default function VehicleBookings() {
  const { user } = useAuth();
  const role = user?.role;
  const location = useLocation();
  const navigate = useNavigate();

  const isRenterHistory =
    role === "RENTER" &&
    location.pathname.includes("/dashboard/renter/rentals");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    setCurrentPage(1);
    fetchBookings();
  }, [role, location.pathname]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      let url = "";
      if (role === "RENTER") url = "/bookings/my";
      if (role === "OWNER") url = "/bookings/view/owner";
      if (role === "ADMIN") url = "/bookings/view/admin";

      const res = await api.get(url);
      let data = res.data || [];

      if (isRenterHistory) {
        data = data.filter((b) => b.status === "COMPLETED");
      }

      setBookings(data);
    } catch {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings =
    statusFilter === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  const { totalPages, paginatedItems: paginatedBookings } = paginate(
    filteredBookings,
    currentPage,
    ITEMS_PER_PAGE
  );

  const goBackToDashboard = () => {
    if (role === "RENTER") navigate("/dashboard/renter");
    if (role === "OWNER") navigate("/dashboard/owner");
    if (role === "ADMIN") navigate("/dashboard/admin");
  };

  const exportCSVFile = () => {
    const headers = [
      "Vehicle",
      "Fuel Type",          
      "Kilometers Driven", 
      "Start Date",
      "End Date",
      "Status",
    ];

    if (role === "OWNER" || role === "ADMIN") {
      headers.push("Renter Name", "Renter Email");
    }

    const rows = bookings.map((b) => {
      const row = [
        `${b.vehicle?.make || ""} ${b.vehicle?.model || ""}`,
        b.vehicle?.fuelType || "",          
        b.vehicle?.kilometersDriven ?? "",   
        formatDate(b.startDate),
        formatDate(b.endDate),
        b.status,
      ];

      if (role === "OWNER" || role === "ADMIN") {
        row.push(b.renter?.name || "", b.renter?.email || "");
      }

      return row;
    });

    const fileName =
      role === "ADMIN"
        ? "bookings-admin.csv"
        : role === "OWNER"
        ? "bookings-owner.csv"
        : "bookings-renter.csv";

    exportCSV({ headers, rows, fileName });
  };

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading…</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 max-w-7xl mx-auto">
      <button
        onClick={goBackToDashboard}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
      >
        <i className="fa-solid fa-arrow-left"></i>
        Back
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {role === "RENTER" && !isRenterHistory && "My Bookings"}
          {role === "RENTER" && isRenterHistory && "Rental History"}
          {role === "OWNER" && "Bookings for My Vehicles"}
          {role === "ADMIN" && "All Bookings"}
        </h1>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white shadow-sm"
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {bookings.length > 0 && (
            <button
              type="button"
              onClick={exportCSVFile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {paginatedBookings.length === 0 ? (
        <p className="text-center text-gray-600">No bookings found.</p>
      ) : (
        <>
          <div className="space-y-6">
            {paginatedBookings.map((b) => (
              <BookingCard
                key={b._id}
                booking={b}
                role={role}
                refresh={fetchBookings}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1.5 text-sm border rounded-lg ${
                    currentPage === i + 1
                      ? "bg-gray-900 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// BOOKING CARD
function BookingCard({ booking, role, refresh }) {
  const { vehicle, renter, startDate, endDate, status, _id } = booking;
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);

  const navigate = useNavigate();

  const confirmCancel = async () => {
    try {
      setCancelling(true);
      await api.put(`/bookings/${_id}/cancel`);
      setShowCancelModal(false);
      refresh();
    } catch {
      alert("Failed to cancel booking");
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
    } catch {
      alert("Unable to modify booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
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

          {(role === "OWNER" || role === "ADMIN") && renter && (
            <div className="pt-3 border-t">
              <p className="font-medium mb-1">Renter Details</p>
              <p>Name: {renter.name}</p>
              <p className="break-all">Email: {renter.email}</p>
            </div>
          )}

          {role === "RENTER" && status === "ACTIVE" && (
            <div className="pt-4 border-t flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModifyModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Modify Booking
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCancelModal(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Cancel Booking
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={showCancelModal}
        title="Cancel booking?"
        description="This booking will be cancelled and cannot be undone."
        confirmText="Yes, Cancel"
        danger
        loading={cancelling}
        onCancel={() => setShowCancelModal(false)}
        onConfirm={confirmCancel}
      />

      <ConfirmModal
        open={showModifyModal}
        title="Modify booking?"
        description="This will cancel your current booking. You’ll need to rebook and pay again."
        confirmText="Yes, Continue"
        loading={cancelling}
        onCancel={() => setShowModifyModal(false)}
        onConfirm={confirmModify}
      />
    </div>
  );
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
