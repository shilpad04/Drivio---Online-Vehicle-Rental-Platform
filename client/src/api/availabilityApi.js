import api from "./axios";

export const checkAvailability = ({ vehicleId, startDate, endDate }) =>
  api.post("/payments/prepare", {
    vehicleId,
    startDate,
    endDate,
  });
