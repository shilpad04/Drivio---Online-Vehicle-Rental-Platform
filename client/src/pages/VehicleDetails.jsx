import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Reviews from "../components/Reviews";
import AuthModal from "../components/AuthModal";

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  const [showAuth, setShowAuth] = useState(false);

  const isRenter = user?.role === "RENTER";
  const isAdmin = user?.role === "ADMIN";
  const isOwner = user?.role === "OWNER";

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        let found;

        if (isAdmin) {
          const res = await api.get("/vehicles/admin/all");
          found = res.data.find((v) => v._id === id);
        } else if (isOwner) {
          const res = await api.get("/vehicles/my");
          found = res.data.find((v) => v._id === id);
        } else {
          const res = await api.get(`/vehicles/${id}`);
          found = res.data;
        }

        if (!found) {
          navigate("/vehicles");
          return;
        }

        setVehicle(found);
      } catch {
        navigate("/vehicles");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id, isAdmin, isOwner, navigate]);

  const checkAvailability = async () => {
    if (!startDate || !endDate) {
      setAvailabilityError("Please select start and end dates");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setAvailabilityError("End date must be after start date");
      return;
    }

    try {
      setCheckingAvailability(true);
      setAvailabilityError("");
      setIsAvailable(false);

      await api.post("/payments/prepare", {
        vehicleId: vehicle._id,
        startDate,
        endDate,
      });

      setIsAvailable(true);
    } catch (err) {
      setAvailabilityError(
        err.response?.data?.message ||
          "Vehicle not available for selected dates"
      );
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (!isAvailable) return;

    navigate(`/vehicles/${vehicle._id}/availability`, {
      state: { startDate, endDate },
    });
  };

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  }

  if (!vehicle) return null;

  const images = vehicle.images || [];

  return (
    <>
      <div className="min-h-screen pt-32 pb-24 px-6 max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="relative bg-gray-100 rounded-xl h-80 overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[currentImageIndex]}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <i className="fa-solid fa-car text-6xl"></i>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2">
              {vehicle.make} {vehicle.model}
            </h1>

            <p className="text-gray-600 mb-4">
              {vehicle.location} • {vehicle.category}
            </p>

            <div className="text-2xl font-semibold text-blue-600 mb-6">
              ₹{vehicle.pricePerDay} / day
            </div>

            {/* Vehicle Details (Visible to all roles) */}
            <div className="border rounded-lg p-5 bg-white shadow-sm mb-6">
              <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>

              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div><span className="font-medium">Vehicle Type:</span> {vehicle.vehicleType}</div>
                <div><span className="font-medium">Year:</span> {vehicle.year}</div>
                <div><span className="font-medium">Fuel Type:</span> {vehicle.fuelType}</div>
                <div><span className="font-medium">Transmission:</span> {vehicle.transmission}</div>
                <div><span className="font-medium">Seats:</span> {vehicle.seatingCapacity}</div>
                <div><span className="font-medium">Category:</span> {vehicle.category}</div>
              </div>

              {vehicle.description && (
                <div className="mt-4">
                  <p className="font-medium mb-1">Description</p>
                  <p className="text-gray-600 text-sm">{vehicle.description}</p>
                </div>
              )}

              {vehicle.features?.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Features</p>
                  <ul className="flex flex-wrap gap-2">
                    {vehicle.features.map((feature, i) => (
                      <li
                        key={i}
                        className="text-xs bg-gray-100 px-3 py-1 rounded-full"
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* OWNER INFO — ADMIN ONLY */}
            {isAdmin && vehicle.ownerId && (
              <div className="border rounded-lg p-5 bg-red-50 mb-6">
                <h3 className="text-lg font-semibold mb-3">Owner Information</h3>
                <p className="text-sm"><span className="font-medium">Name:</span> {vehicle.ownerId.name}</p>
                <p className="text-sm"><span className="font-medium">Email:</span> {vehicle.ownerId.email}</p>
                <p className="text-sm"><span className="font-medium">Role:</span> {vehicle.ownerId.role}</p>
              </div>
            )}

            {isRenter && vehicle.status === "approved" && (
              <div className="mb-6 border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-2">Check Availability</h3>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setIsAvailable(false);
                    }}
                    className="border p-2 rounded"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setIsAvailable(false);
                    }}
                    className="border p-2 rounded"
                  />
                </div>

                {availabilityError && (
                  <p className="text-red-500 mt-2">{availabilityError}</p>
                )}

                {isAvailable && (
                  <p className="text-green-600 mt-2 font-medium">
                    Vehicle available for selected dates
                  </p>
                )}

                <button
                  onClick={checkAvailability}
                  disabled={checkingAvailability}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {checkingAvailability ? "Checking..." : "Check Availability"}
                </button>
              </div>
            )}

            {vehicle.status === "approved" && !isOwner && !isAdmin && (
              <button
                onClick={handleBookNow}
                disabled={user && !isAvailable}
                className={`px-6 py-3 rounded-lg text-white ${
                  user && !isAvailable
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Book Now
              </button>
            )}
          </div>
        </div>

        <div className="mt-14">
          <Reviews vehicleId={vehicle._id} />
        </div>
      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        defaultTab="login"
      />
    </>
  );
}

// ///
// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../api/axios";
// import { useAuth } from "../context/AuthContext";
// import Reviews from "../components/Reviews";
// import AuthModal from "../components/AuthModal";

// export default function VehicleDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   const [vehicle, setVehicle] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [checkingAvailability, setCheckingAvailability] = useState(false);
//   const [isAvailable, setIsAvailable] = useState(false);
//   const [availabilityError, setAvailabilityError] = useState("");

//   const [showAuth, setShowAuth] = useState(false);

//   const isRenter = user?.role === "RENTER";
//   const isAdmin = user?.role === "ADMIN";
//   const isOwner = user?.role === "OWNER";

//   const today = new Date().toISOString().split("T")[0];

//   useEffect(() => {
//     const fetchVehicle = async () => {
//       try {
//         let found;

//         if (isAdmin) {
//           const res = await api.get("/vehicles/admin/all");
//           found = res.data.find((v) => v._id === id);
//         } else if (isOwner) {
//           const res = await api.get("/vehicles/my");
//           found = res.data.find((v) => v._id === id);
//         } else {
//           const res = await api.get(`/vehicles/${id}`);
//           found = res.data;
//         }

//         if (!found) {
//           navigate("/vehicles");
//           return;
//         }

//         setVehicle(found);
//       } catch {
//         navigate("/vehicles");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchVehicle();
//   }, [id, isAdmin, isOwner, navigate]);

//   const checkAvailability = async () => {
//     if (!startDate || !endDate) {
//       setAvailabilityError("Please select start and end dates");
//       return;
//     }

//     if (startDate < today) {
//       setAvailabilityError("Start date cannot be in the past");
//       return;
//     }

//     if (new Date(endDate) <= new Date(startDate)) {
//       setAvailabilityError("End date must be after start date");
//       return;
//     }

//     try {
//       setCheckingAvailability(true);
//       setAvailabilityError("");
//       setIsAvailable(false);

//       await api.post("/payments/prepare", {
//         vehicleId: vehicle._id,
//         startDate,
//         endDate,
//       });

//       setIsAvailable(true);
//     } catch (err) {
//       setAvailabilityError(
//         err.response?.data?.message ||
//           "Vehicle not available for selected dates"
//       );
//     } finally {
//       setCheckingAvailability(false);
//     }
//   };

//   const handleBookNow = () => {
//     if (!user) {
//       setShowAuth(true);
//       return;
//     }

//     if (!isAvailable) return;

//     navigate(`/vehicles/${vehicle._id}/availability`, {
//       state: { startDate, endDate },
//     });
//   };

//   if (loading) {
//     return <div className="min-h-screen pt-32 text-center">Loading...</div>;
//   }

//   if (!vehicle) return null;

//   const images = vehicle.images || [];

//   return (
//     <>
//       <div className="min-h-screen pt-32 pb-24 px-6 max-w-6xl mx-auto">
//         <button
//           onClick={() => navigate(-1)}
//           className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
//         >
//           <i className="fa-solid fa-arrow-left"></i>
//           Back
//         </button>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
//           <div className="relative bg-gray-100 rounded-xl h-80 overflow-hidden">
//             {images.length > 0 ? (
//               <img
//                 src={images[currentImageIndex]}
//                 alt={`${vehicle.make} ${vehicle.model}`}
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="h-full flex items-center justify-center text-gray-400">
//                 <i className="fa-solid fa-car text-6xl"></i>
//               </div>
//             )}
//           </div>

//           <div>
//             <h1 className="text-3xl font-bold mb-2">
//               {vehicle.make} {vehicle.model}
//             </h1>

//             <p className="text-gray-600 mb-4">
//               {vehicle.location} • {vehicle.category}
//             </p>

//             <div className="text-2xl font-semibold text-blue-600 mb-6">
//               ₹{vehicle.pricePerDay} / day
//             </div>

//             {/* Vehicle Details */}
//             <div className="border rounded-lg p-5 bg-white shadow-sm mb-6">
//               <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>

//               <div className="grid grid-cols-2 gap-y-3 text-sm">
//                 <div><span className="font-medium">Vehicle Type:</span> {vehicle.vehicleType}</div>
//                 <div><span className="font-medium">Year:</span> {vehicle.year}</div>
//                 <div><span className="font-medium">Fuel Type:</span> {vehicle.fuelType}</div>
//                 <div><span className="font-medium">Transmission:</span> {vehicle.transmission}</div>
//                 <div><span className="font-medium">Seats:</span> {vehicle.seatingCapacity}</div>
//                 <div><span className="font-medium">Category:</span> {vehicle.category}</div>
//               </div>
//             </div>

//             {/* OWNER INFO — ADMIN ONLY */}
//             {isAdmin && vehicle.ownerId && (
//               <div className="border rounded-lg p-5 bg-red-50 mb-6">
//                 <h3 className="text-lg font-semibold mb-3">Owner Information</h3>
//                 <p className="text-sm"><span className="font-medium">Name:</span> {vehicle.ownerId.name}</p>
//                 <p className="text-sm"><span className="font-medium">Email:</span> {vehicle.ownerId.email}</p>
//                 <p className="text-sm"><span className="font-medium">Role:</span> {vehicle.ownerId.role}</p>
//               </div>
//             )}

//             {isRenter && vehicle.status === "approved" && (
//               <div className="mb-6 border rounded-lg p-4 bg-gray-50">
//                 <h3 className="font-semibold mb-2">Check Availability</h3>

//                 <div className="grid grid-cols-2 gap-3">
//                   <input
//                     type="date"
//                     min={today}
//                     value={startDate}
//                     onChange={(e) => {
//                       setStartDate(e.target.value);
//                       setEndDate("");
//                       setIsAvailable(false);
//                     }}
//                     className="border p-2 rounded"
//                   />

//                   <input
//                     type="date"
//                     min={startDate || today}
//                     value={endDate}
//                     onChange={(e) => {
//                       setEndDate(e.target.value);
//                       setIsAvailable(false);
//                     }}
//                     className="border p-2 rounded"
//                   />
//                 </div>

//                 {availabilityError && (
//                   <p className="text-red-500 mt-2">{availabilityError}</p>
//                 )}

//                 {isAvailable && (
//                   <p className="text-green-600 mt-2 font-medium">
//                     Vehicle available for selected dates
//                   </p>
//                 )}

//                 <button
//                   onClick={checkAvailability}
//                   disabled={checkingAvailability}
//                   className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   {checkingAvailability ? "Checking..." : "Check Availability"}
//                 </button>
//               </div>
//             )}

//             {vehicle.status === "approved" && !isOwner && !isAdmin && (
//               <button
//                 onClick={handleBookNow}
//                 disabled={user && !isAvailable}
//                 className={`px-6 py-3 rounded-lg text-white ${
//                   user && !isAvailable
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-blue-600 hover:bg-blue-700"
//                 }`}
//               >
//                 Book Now
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="mt-14">
//           <Reviews vehicleId={vehicle._id} />
//         </div>
//       </div>

//       <AuthModal
//         isOpen={showAuth}
//         onClose={() => setShowAuth(false)}
//         defaultTab="login"
//       />
//     </>
//   );
// }
