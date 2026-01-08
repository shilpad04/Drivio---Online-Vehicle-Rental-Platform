import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import VehicleCard from "../components/VehicleCard";
import { useAuth } from "../context/AuthContext";

const ITEMS_PER_PAGE = 6;

export default function Vehicles() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "ADMIN";
  const isOwner = user?.role === "OWNER";
  const isRenter = user?.role === "RENTER";

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        let res;

        if (isAdmin) {
          const query =
            statusFilter !== "all" ? `?status=${statusFilter}` : "";
          res = await api.get(`/vehicles/admin/all${query}`);
          setVehicles(res.data);
        } else if (isOwner) {
          res = await api.get("/vehicles/my");

          const filtered =
            statusFilter === "all"
              ? res.data
              : res.data.filter(
                  (v) => v.status === statusFilter
                );

          setVehicles(filtered);
        } else {
          res = await api.get("/vehicles");
          setVehicles(res.data);
        }

        setCurrentPage(1);
      } catch (error) {
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [user, isAdmin, isOwner, statusFilter]);

  const handleBack = () => {
    navigate(-1);
  };

  const totalPages = Math.ceil(vehicles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVehicles = vehicles.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-32 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      {/* BACK BUTTON */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
      >
        <i className="fa-solid fa-arrow-left"></i>
        Back
      </button>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isAdmin
            ? "All Vehicles"
            : isOwner
            ? "My Vehicles"
            : "Available Vehicles"}
        </h1>

        {(isAdmin || isOwner) && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        )}
      </div>

      {/* VEHICLE GRID */}
      {paginatedVehicles.length === 0 ? (
        <p className="text-gray-500">No vehicles found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedVehicles.map((vehicle) => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((p) => Math.max(p - 1, 1))
            }
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
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
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(p + 1, totalPages)
              )
            }
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
