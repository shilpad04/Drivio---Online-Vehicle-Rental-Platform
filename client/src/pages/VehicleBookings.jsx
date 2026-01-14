import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";
import StatusBadge from "../components/StatusBadge";
import { paginate } from "../utils/pagination";
import { formatDate } from "../utils/formatDate";
import BookingCard from "../components/BookingCard";
import useVehicleBookings from "../hooks/useVehicleBookings";

const ITEMS_PER_PAGE = 5;

export default function VehicleBookings() {
  const { user } = useAuth();
  const role = user?.role;
  const navigate = useNavigate();

  const {
    bookings,
    paymentMap,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedBookings,
    isRenterHistory,
    exportCSVFile,
    refreshBookings,
  } = useVehicleBookings(ITEMS_PER_PAGE);

  const goBackToDashboard = () => {
    if (role === "RENTER") navigate("/dashboard/renter");
    if (role === "OWNER") navigate("/dashboard/owner");
    if (role === "ADMIN") navigate("/dashboard/admin");
  };

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading…</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 text-center text-red-600">{error}</div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 max-w-7xl mx-auto">
      <BackButton onClick={goBackToDashboard} />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {role === "RENTER" && !isRenterHistory && "My Bookings"}
          {role === "RENTER" && isRenterHistory && "Rental History"}
          {role === "OWNER" && "Bookings for My Vehicles"}
          {role === "ADMIN" && "All Bookings"}
        </h1>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={
              role === "ADMIN" ? "Search renter or vehicle" : "Search vehicle"
            }
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white shadow-sm w-56"
          />

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

          {role === "ADMIN" && bookings.length > 0 && (
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
                refresh={refreshBookings}
                amountPaid={paymentMap[b._id]}
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
