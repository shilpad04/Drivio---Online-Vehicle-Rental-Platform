import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

export default function VehicleCard({ vehicle }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showAuth, setShowAuth] = useState(false);

  const showStatus = user && user.role !== "RENTER";

  const handleCardClick = () => {
    navigate(`/vehicles/${vehicle._id}`);
  };

  const handleBookNow = (e) => {
    e.stopPropagation();

    if (!user) {
      setShowAuth(true);
      return;
    }

    if (user.role === "RENTER") {
      navigate(`/vehicles/${vehicle._id}`);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="relative bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-lg transition"
      >
        {showStatus && (
          <span
            className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded
              ${
                vehicle.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : vehicle.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
          >
            {vehicle.status.toUpperCase()}
          </span>
        )}

        <div className="h-40 bg-gray-200 rounded mb-4 overflow-hidden">
          {vehicle.images?.length > 0 ? (
            <img
              src={vehicle.images[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              {vehicle.vehicleType?.toUpperCase()}
            </div>
          )}
        </div>

        <h3 className="font-semibold text-lg">
          {vehicle.make} {vehicle.model}
        </h3>

        <p className="text-sm text-gray-500">{vehicle.location}</p>

        <p className="mt-2 font-bold text-blue-600">
          ₹{vehicle.pricePerDay} / day
        </p>

        {vehicle.status === "approved" && (
          <button
            onClick={handleBookNow}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Book Now
          </button>
        )}
      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        defaultTab="login"
      />
    </>
  );
}
