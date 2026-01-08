import api from "./axios";

// PUBLIC / OWNER / RENTER
export const getVehicleReviews = (vehicleId, params = {}) =>
  api.get(`/reviews/vehicle/${vehicleId}`, { params });

// RENTER
export const addReview = (data) =>
  api.post("/reviews", data);

// ADMIN
export const getAllReviewsForAdmin = () =>
  api.get("/reviews/admin");
