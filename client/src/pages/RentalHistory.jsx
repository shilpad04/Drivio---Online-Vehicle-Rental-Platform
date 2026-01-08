import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Reviews from "../components/Reviews";

export default function RentalHistory() {
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRentalHistory();
  }, []);

  const fetchRentalHistory = async () => {
    try {
      setLoading(true);

      const res = await api.get("/bookings/my");

      const history = (res.data || []).filter(
        (b) => b.status === "COMPLETED" || b.status === "CANCELLED"
      );

      setRentals(history);
    } catch {
      setError("Failed to load rental history");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // CSV EXPORT — RENTER HISTORY
  // ===============================
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
      {/* BACK BUTTON — MATCHES VehicleBookings */}
      <button
        onClick={() => navigate("/dashboard/renter")}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
      >
        ← Back
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

      {rentals.length === 0 ? (
        <p className="text-center text-gray-600">
          No rental history available.
        </p>
      ) : (
        <div className="space-y-6">
          {rentals.map((rental) => (
            <RentalCard key={rental._id} rental={rental} />
          ))}
        </div>
      )}
    </div>
  );
}

function RentalCard({ rental }) {
  const { vehicle, startDate, endDate, status, _id } = rental;

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-56 h-40 bg-gray-100 rounded overflow-hidden">
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
          <h2 className="font-semibold text-lg">
            {vehicle?.make} {vehicle?.model}
          </h2>

          <p className="text-sm text-gray-600 mt-1">
            {formatDate(startDate)} → {formatDate(endDate)}
          </p>

          <div className="mt-3">
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {status === "COMPLETED" && (
        <div className="pt-4 border-t">
          <Reviews
            vehicleId={vehicle._id}
            bookingId={_id}
            singleReview
          />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}
    >
      {status}
    </span>
  );
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
