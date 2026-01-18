import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import VehicleCard from "../components/VehicleCard";
import { useAuth } from "../context/AuthContext";
import FilterBar from "../components/FilterBar";
import { paginate } from "../utils/pagination";

const ITEMS_PER_PAGE = 6;

export default function Vehicles({ searchQuery, locationQuery }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === "ADMIN";
  const isOwner = user?.role === "OWNER";

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [vehicleType, setVehicleType] = useState("");
  const [category, setCategory] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [fuelType, setFuelType] = useState("");

  const [adminSearch, setAdminSearch] = useState("");
  const [ownerSearch, setOwnerSearch] = useState("");
  const [debouncedOwnerSearch, setDebouncedOwnerSearch] = useState("");

  useEffect(() => {
    if (!isOwner) return;
    const timer = setTimeout(() => {
      setDebouncedOwnerSearch(ownerSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [ownerSearch, isOwner]);

  useEffect(() => {
    setLocationFilter(locationQuery);
  }, [locationQuery]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        let res;

        if (isAdmin) {
          const params = {};
          if (statusFilter !== "all") params.status = statusFilter;
          if (adminSearch && adminSearch.trim())
            params.search = adminSearch.trim();

          res = await api.get("/vehicles/admin/all", { params });
          setVehicles(res.data);

        } else if (isOwner) {
          const params = {};
          if (statusFilter !== "all") params.status = statusFilter;
          if (debouncedOwnerSearch && debouncedOwnerSearch.trim())
            params.search = debouncedOwnerSearch.trim();

          res = await api.get("/vehicles/my", { params });
          setVehicles(res.data);

        } else {
          if (locationQuery && !locationFilter) return;

          const params = {};
          if (searchQuery && searchQuery.trim())
            params.search = searchQuery.trim();
          if (locationFilter) params.location = locationFilter;
          if (vehicleType) params.vehicleType = vehicleType;
          if (category) params.category = category;
          if (fuelType) params.fuelType = fuelType;
          if (minPrice) params.minPrice = minPrice;
          if (maxPrice) params.maxPrice = maxPrice;

          res = await api.get("/vehicles", { params });
          setVehicles(res.data);
        }

        setCurrentPage(1);
      } catch {
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [
    user,
    isAdmin,
    isOwner,
    statusFilter,
    searchQuery,
    adminSearch,
    debouncedOwnerSearch,
    vehicleType,
    category,
    locationFilter,
    fuelType,
    minPrice,
    maxPrice,
    locationQuery,
    location.state,
  ]);

  const handleBack = () => {
    if (isOwner) navigate("/dashboard/owner");
    else if (isAdmin) navigate("/dashboard/admin");
    else navigate("/");
  };

  const { totalPages, paginatedItems: paginatedVehicles } = paginate(
    vehicles,
    currentPage,
    ITEMS_PER_PAGE
  );

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
      >
        <i className="fa-solid fa-arrow-left"></i>
        Back
      </button>

      {!isAdmin && !isOwner && (
        <FilterBar
          vehicleType={vehicleType}
          setVehicleType={setVehicleType}
          category={category}
          setCategory={setCategory}
          location={locationFilter}
          setLocation={setLocationFilter}
          fuelType={fuelType}
          setFuelType={setFuelType}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
        />
      )}

      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">
          {isAdmin
            ? "All Vehicles"
            : isOwner
            ? "My Vehicles"
            : "Available Vehicles"}
        </h1>
      </div>

      {(isAdmin || isOwner) && (
        <div className="flex flex-wrap gap-3 justify-end mb-8">
          {isAdmin && (
            <input
              type="text"
              value={adminSearch}
              onChange={(e) => {
                setAdminSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search vehicle"
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white shadow-sm w-56"
            />
          )}

          {isOwner && (
            <input
              type="text"
              value={ownerSearch}
              onChange={(e) => {
                setOwnerSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search vehicle"
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white shadow-sm w-56"
            />
          )}

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      )}

      {paginatedVehicles.length === 0 ? (
        <p className="text-gray-500">No vehicles found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedVehicles.map((vehicle) => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
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
