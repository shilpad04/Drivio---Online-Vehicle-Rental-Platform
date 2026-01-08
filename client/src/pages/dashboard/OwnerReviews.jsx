import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Reviews from "../../components/Reviews";

export default function OwnerReviews() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyVehicles();
  }, []);

  const fetchMyVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vehicles/my");
      setVehicles(res.data || []);
    } catch (err) {
      console.error("Failed to load owner vehicles");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      {/* BACK */}
      <button
        onClick={() => navigate("/dashboard/owner")}
        className="mb-6 text-sm text-blue-600 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-8">
        Reviews for My Vehicles
      </h1>

      {vehicles.length === 0 ? (
        <p className="text-gray-600 text-center">
          You have not added any vehicles yet.
        </p>
      ) : (
        <div className="space-y-12">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold mb-1">
                {vehicle.make} {vehicle.model}
              </h2>

              <p className="text-sm text-gray-600 mb-4">
                {vehicle.location} • {vehicle.category}
              </p>

              {/* REVIEWS FOR THIS VEHICLE */}
              <Reviews vehicleId={vehicle._id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
