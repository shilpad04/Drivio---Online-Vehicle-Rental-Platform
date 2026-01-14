import api from "./axios";

// RENTER
export const getMyPayments = async (params = {}) => {
  const res = await api.get("/payments/my", { params });
  return res.data;
};

// ADMIN
export const getAllPaymentsAdmin = async (params = {}) => {
  const res = await api.get("/payments/admin", { params });
  return res.data;
};
