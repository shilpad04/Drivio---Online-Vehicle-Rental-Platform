import { useEffect, useState } from "react";
import { getApprovedVehicles } from "../api/vehicleApi";
import VehicleCard from "../components/VehicleCard";
import AuthModal from "../components/AuthModal";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Landing({ locationQuery }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showOwnerOnly, setShowOwnerOnly] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await getApprovedVehicles({});
        setVehicles(data);
      } catch {
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const handleExplore = () => {
    if (locationQuery) {
      navigate(`/vehicles?location=${encodeURIComponent(locationQuery)}`);
    } else {
      navigate("/vehicles");
    }
  };

  const handleListVehicle = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (user.role !== "owner") {
      setShowOwnerOnly(true);
      return;
    }
    navigate("/dashboard/owner");
  };

  return (
    <>
      {/* HERO */}
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
          </div>
        </div>
      </section>

      {/* VEHICLES */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10">Popular Vehicles</h2>

          {!loading && vehicles.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6">
              {vehicles.slice(0, 3).map((vehicle) => (
                <VehicleCard key={vehicle._id} vehicle={vehicle} />
              ))}
            </div>
          )}

          <div className="mt-12 flex gap-4 justify-center">
            <button
              onClick={handleExplore}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow"
            >
              Explore Vehicles
            </button>

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
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        defaultTab="register"
      />

      <ConfirmModal
        open={showOwnerOnly}
        title="Access Restricted"
        description="Only owners can list vehicles."
        confirmText="OK"
        cancelText="Close"
        onConfirm={() => setShowOwnerOnly(false)}
        onCancel={() => setShowOwnerOnly(false)}
      />
    </>
  );
}
