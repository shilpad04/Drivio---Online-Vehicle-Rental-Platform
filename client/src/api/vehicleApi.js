import axios from "axios";
import api from "./axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

/* ===========================
   PUBLIC
=========================== */

export const getApprovedVehicles = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/api/vehicles`, {
    params,
  });
  return response.data;
};

export const getVehicleById = async (id) => {
  const response = await axios.get(
    `${API_BASE_URL}/api/vehicles/${id}`
  );
  return response.data;
};

/* ===========================
   OWNER
=========================== */

export const addVehicle = async (vehicleData) => {
  const response = await api.post("/vehicles", vehicleData);
  return response.data;
};

export const getMyVehicles = async () => {
  const response = await api.get("/vehicles/my");
  return response.data;
};

/* ===========================
   ADMIN
=========================== */

export const approveVehicle = async (id) => {
  const response = await api.put(`/vehicles/${id}/approve`);
  return response.data;
};

export const rejectVehicle = async (id) => {
  const response = await api.put(`/vehicles/${id}/reject`);
  return response.data;
};
