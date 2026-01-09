import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Reviews from "../../components/Reviews";
import { paginate } from "../../utils/pagination"; 

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

  /* ===============================
     PAGINATION LOGIC
  =============================== */
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
      {/* BACK */}
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
                className="bg-white rounded-xl shadow p-6"
              >
                {/* VEHICLE HEADER */}
                <div className="flex flex-col md:flex-row gap-6 mb-4">
                  {/* IMAGE */}
                  <div className="w-full md:w-56 h-36 bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-90">
                    {vehicle.images?.[0] ? (
                      <img
                        src={vehicle.images[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* BASIC INFO */}
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold mb-1">
                      {vehicle.make} {vehicle.model}
                    </h2>

                    <p className="text-sm text-gray-600 mb-2">
                      {vehicle.location} • {vehicle.category}
                    </p>

                    {/* VIEW VEHICLE */}
                    <button
                      onClick={() => navigate(`/vehicles/${vehicle._id}`)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View vehicle →
                    </button>
                  </div>
                </div>

                {/* REVIEWS SECTION */}
                <div className="border-t pt-5 mt-5">
                  <h3 className="text-md font-semibold mb-1">
                    Customer Reviews
                  </h3>

                  {/* HELPER TEXT (ADD) */}
                  <p className="text-xs text-gray-500 mb-3">
                    Reviews are visible after a completed booking.
                  </p>

                  {/* EMPTY STATE (ADD) */}
                  <div className="text-sm text-gray-500 mb-3">
                    No reviews yet for this vehicle.
                  </div>

                  {/* REVIEWS FOR THIS VEHICLE */}
                  <Reviews vehicleId={vehicle._id} />
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
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
