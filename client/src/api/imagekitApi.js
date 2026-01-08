import api from "./axios";

export const getImageKitAuth = async () => {
  const response = await api.get("/imagekit/auth");
  return response.data;
};
