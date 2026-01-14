import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Reviews from "../components/Reviews";
import { paginate } from "../utils/pagination";
import StatusBadge from "../components/StatusBadge";
import BackButton from "../components/BackButton";
import { formatDate } from "../utils/formatDate";

const ITEMS_PER_PAGE = 5;

export default function RentalHistory() {
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [paginatedRentals, setPaginatedRentals] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchRentalHistory();
  }, []);

  useEffect(() => {
    const filtered =
      statusFilter === "ALL"
        ? rentals
        : rentals.filter(
            (r) => String(r.status).toUpperCase().trim() === statusFilter
          );

    if (!filtered.length) {
      setPaginatedRentals([]);
      setTotalPages(1);
      return;
    }

    const { totalPages, paginatedItems } = paginate(
      filtered,
      currentPage,
      ITEMS_PER_PAGE
    );

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      return;
    }

    setPaginatedRentals(paginatedItems);
    setTotalPages(totalPages);
  }, [rentals, currentPage, statusFilter]);

  const fetchRentalHistory = async () => {
    try {
      setLoading(true);

      const res = await api.get("/bookings/my");

      const history = (res.data || []).filter((b) => {
        const status = String(b.status).toUpperCase().trim();
        return (
          (status === "COMPLETED" || status === "CANCELLED") && b.vehicle
        );
      });

      setRentals(history);
      setCurrentPage(1);
    } catch {
      setError("Failed to load rental history");
    } finally {
      setLoading(false);
    }
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
      <BackButton to="/dashboard/renter" />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Rental History</h1>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded px-4 py-2 text-sm"
        >
          <option value="ALL">All</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {paginatedRentals.length === 0 ? (
        <p className="text-center text-gray-600">
          No rental history available.
        </p>
      ) : (
        <>
          <div className="space-y-6">
            {paginatedRentals.map((rental) => (
              <RentalCard key={rental._id} rental={rental} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
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

function RentalCard({ rental }) {
  const navigate = useNavigate();

  const { vehicle, startDate, endDate, status, _id, updatedAt } = rental;

  if (!vehicle) return null;

  const normalizedStatus = String(status).toUpperCase().trim();
  const isCancelled = normalizedStatus === "CANCELLED";
  const isCompleted = normalizedStatus === "COMPLETED";

  return (
    <div
      className={`rounded-xl shadow p-6 space-y-4 ${
        isCancelled ? "bg-red-50 border border-red-100" : "bg-white"
      }`}
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-56 h-40 bg-gray-100 rounded overflow-hidden">
          {vehicle.images?.[0] ? (
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
          <h2 className="font-semibold text-lg">
            {vehicle.make} {vehicle.model}
          </h2>

          <p className="text-sm text-gray-600 mt-1">
            {formatDate(startDate)} → {formatDate(endDate)}
          </p>

          <div className="mt-3">
            <StatusBadge status={normalizedStatus} />
          </div>
        </div>
      </div>

      {isCancelled && (
        <div className="pt-4 border-t border-red-200 space-y-2">
          <p className="text-sm text-red-700 font-medium">
            ❌ Booking was cancelled
          </p>

          {updatedAt && (
            <p className="text-xs text-red-600">
              Cancelled on: {formatDate(updatedAt)}
            </p>
          )}

          <button
            onClick={() => navigate(`/vehicles/${vehicle._id}`)}
            className="text-sm text-blue-600 hover:underline"
          >
            🔁 Book this vehicle again
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="pt-4 border-t space-y-4">
          <div className="bg-gray-50 border rounded-lg p-3 flex justify-between items-center text-sm">
            <div>
              <p className="font-medium">Payment Completed</p>
              <p className="text-xs text-gray-500">
                Invoice available in Payments section
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard/renter/payments")}
              className="text-blue-600 hover:underline"
            >
              View Payment
            </button>
          </div>

          <Reviews vehicleId={vehicle._id} bookingId={_id} singleReview />
        </div>
      )}
    </div>
  );
}
