import { useEffect, useState } from "react";
import { getApprovedVehicles } from "../api/vehicleApi";
import VehicleCard from "../components/VehicleCard";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Landing({ searchQuery, setSearchQuery }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const [filters, setFilters] = useState({
    vehicleType: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const params = {};

        if (searchQuery.trim()) {
          const parts = searchQuery.trim().split(" ");
          if (parts.length === 1) {
            params.search = searchQuery;
          } else {
            params.search = parts.slice(0, -1).join(" ");
            params.location = parts[parts.length - 1];
          }
        }

        if (filters.vehicleType) params.vehicleType = filters.vehicleType;
        if (filters.category) params.category = filters.category;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;

        const data = await getApprovedVehicles(params);
        setVehicles(data);
      } catch {
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [searchQuery, filters]);

  const handleListVehicle = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    navigate("/dashboard/owner");
  };

  return (
    <>
      <section
        className="pt-40 pb-32 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1503376780353-7e6692767b70)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-xl bg-white/90 backdrop-blur rounded-2xl p-8 shadow-lg">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Rent Cars & Bikes <br /> Anytime, Anywhere
            </h1>

            <p className="mt-4 text-gray-600">
              Your next ride is just a few clicks away
            </p>

            <div className="mt-6 flex items-center bg-white rounded-xl shadow overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicle or location"
                className="flex-1 px-4 py-3 outline-none"
              />
              <button className="px-5 py-3 bg-blue-600 text-white">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10">
            Popular Vehicles
          </h2>

          {loading && <p className="text-gray-500">Loading vehicles...</p>}

          {!loading && vehicles.length === 0 && (
            <p className="text-gray-500">
              No vehicles available at the moment
            </p>
          )}

          {!loading && vehicles.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6">
              {vehicles.slice(0, 3).map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          )}

          <div className="mt-12 flex gap-4 justify-center">
            <a
              href="/vehicles"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow"
            >
              Explore Vehicles
            </a>

            <button
              onClick={handleListVehicle}
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg"
            >
              List Your Vehicle
            </button>
          </div>
        </div>
      </section>

      <AuthModal
        key={showAuth ? "register" : "closed"}
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        defaultTab="register"
      />
    </>
  );
}
