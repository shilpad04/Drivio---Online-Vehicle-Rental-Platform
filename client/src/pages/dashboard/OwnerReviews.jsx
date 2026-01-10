import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Reviews from "../../components/Reviews";

const ITEMS_PER_PAGE = 3;

export default function OwnerReviews() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMyVehicles();
  }, []);

  const fetchMyVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vehicles/my");
      setVehicles(res.data || []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to load owner vehicles");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(vehicles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVehicles = vehicles.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate("/dashboard/owner")}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
      >
        <i className="fa-solid fa-arrow-left"></i>
        Back
      </button>

      <h1 className="text-2xl font-bold mb-8">Reviews for My Vehicles</h1>

      {vehicles.length === 0 ? (
        <p className="text-gray-600 text-center">
          You have not added any vehicles yet.
        </p>
      ) : (
        <>
          <div className="space-y-12">
            {paginatedVehicles.map((vehicle) => (
              <div
                key={vehicle._id}
                className="bg-white rounded-xl shadow p-6 space-y-4"
              >
                <div className="flex gap-4">
                  <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {vehicle.images?.[0] ? (
                      <img
                        src={vehicle.images[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">
                      {vehicle.make} {vehicle.model}
                    </h2>

                    <p className="text-sm text-gray-600">
                      {vehicle.location} • {vehicle.category}
                    </p>

                    <button
                      onClick={() =>
                        navigate(`/vehicles/${vehicle._id}`)
                      }
                      className="text-sm text-blue-600 hover:underline mt-1"
                    >
                      View vehicle →
                    </button>
                  </div>
                </div>

                {/* REVIEWS */}
                <Reviews vehicleId={vehicle._id} />
              </div>
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
