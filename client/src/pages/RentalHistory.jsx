import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Reviews from "../components/Reviews";
import { paginate } from "../utils/pagination";
import StatusBadge from "../components/StatusBadge";

const ITEMS_PER_PAGE = 5;

export default function RentalHistory() {
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [paginatedRentals, setPaginatedRentals] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRentalHistory();
  }, []);

  // ✅ FIXED PAGINATION EFFECT
  useEffect(() => {
    if (!rentals.length) {
      setPaginatedRentals([]);
      setTotalPages(1);
      return;
    }

    const { totalPages, paginatedItems } = paginate(
      rentals,
      currentPage,
      ITEMS_PER_PAGE
    );

    // ✅ clamp invalid page
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      return;
    }

    setPaginatedRentals(paginatedItems);
    setTotalPages(totalPages);
  }, [rentals, currentPage]);

  const fetchRentalHistory = async () => {
    try {
      setLoading(true);

      const res = await api.get("/bookings/my");

      // ✅ filter only valid bookings
      const history = (res.data || []).filter(
        (b) =>
          (b.status === "COMPLETED" || b.status === "CANCELLED") &&
          b.vehicle
      );

      setRentals(history);
      setCurrentPage(1);
    } catch {
      setError("Failed to load rental history");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!rentals.length) return;

    const headers = ["Vehicle", "Start Date", "End Date", "Status"];

    const rows = rentals.map((r) => [
      `${r.vehicle?.make || ""} ${r.vehicle?.model || ""}`,
      formatDate(r.startDate),
      formatDate(r.endDate),
      r.status,
    ]);

    const csv =
      headers.join(",") +
      "\n" +
      rows
        .map((row) =>
          row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "rental-history.csv";
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
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
        type="button"
        onClick={() => navigate("/dashboard/renter")}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
      >
        <i className="fa-solid fa-arrow-left"></i>
        Back
      </button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Rental History</h1>

        {rentals.length > 0 && (
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Export CSV
          </button>
        )}
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
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-40"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 text-sm border rounded disabled:opacity-40"
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

  if (!vehicle) return null; // ✅ safety

  const isCancelled = status === "CANCELLED";

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
            <StatusBadge status={status} />
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
            className="text-sm text-blue-600 hover:underline mt-2"
          >
            🔁 Book this vehicle again
          </button>
        </div>
      )}

      {status === "COMPLETED" && (
        <div className="pt-4 border-t">
          <Reviews vehicleId={vehicle._id} bookingId={_id} singleReview />
        </div>
      )}
    </div>
  );
}

<StatusBadge status={status} />

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
