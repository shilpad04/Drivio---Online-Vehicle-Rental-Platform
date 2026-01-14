import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { addVehicle } from "../api/vehicleApi";

export default function useAddVehicle() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [vehicleStatus, setVehicleStatus] = useState(null);

  const [messageModal, setMessageModal] = useState({
    open: false,
    title: "",
    description: "",
  });

  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    vehicleType: "",
    category: "",
    fuelType: "",
    kilometersDriven: "",
    location: "",
    pricePerDay: "",
    description: "",
  });

  useEffect(() => {
    if (!isEditMode) return;

    const fetchVehicle = async () => {
      try {
        const res = await api.get("/vehicles/my");
        const vehicle = res.data.find((v) => v._id === id);

        if (!vehicle) {
          navigate("/dashboard/owner");
          return;
        }

        setForm({
          make: vehicle.make || "",
          model: vehicle.model || "",
          year: vehicle.year || "",
          vehicleType: vehicle.vehicleType || "",
          category: vehicle.category || "",
          fuelType: vehicle.fuelType || "",
          kilometersDriven:
            vehicle.kilometersDriven !== undefined
              ? String(vehicle.kilometersDriven)
              : "",
          location: vehicle.location || "",
          pricePerDay:
            vehicle.pricePerDay !== undefined
              ? String(vehicle.pricePerDay)
              : "",
          description: vehicle.description || "",
        });

        setImages(vehicle.images || []);
        setVehicleStatus(vehicle.status);
      } catch {
        navigate("/dashboard/owner");
      }
    };

    fetchVehicle();
  }, [id, isEditMode, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setLoading(true);
      const payload = {};

      if (form.kilometersDriven !== "" && !isNaN(form.kilometersDriven)) {
        payload.kilometersDriven = Number(form.kilometersDriven);
      }

      if (!isEditMode || vehicleStatus !== "approved") {
        if (form.pricePerDay !== "" && !isNaN(form.pricePerDay)) {
          payload.pricePerDay = Number(form.pricePerDay);
        }

        if (form.location) payload.location = form.location;
        if (form.description) payload.description = form.description;
        if (form.fuelType) payload.fuelType = form.fuelType;
        if (form.category) payload.category = form.category;
        if (form.vehicleType) payload.vehicleType = form.vehicleType;
      }

      if (isEditMode && vehicleStatus === "rejected") {
        payload.status = "pending";
      }

      if (isEditMode) {
        await api.put(`/vehicles/${id}`, payload);

        setMessageModal({
          open: true,
          title: "Vehicle Updated",
          description:
            vehicleStatus === "rejected"
              ? "Vehicle resubmitted for admin approval."
              : "Vehicle updated successfully.",
        });
      } else {
        await addVehicle({
          ...form,
          year: Number(form.year),
          pricePerDay: Number(form.pricePerDay),
          kilometersDriven: Number(form.kilometersDriven),
          images,
        });

        setMessageModal({
          open: true,
          title: "Vehicle Submitted",
          description: "Vehicle submitted for admin approval.",
        });
      }
    } catch {
      setMessageModal({
        open: true,
        title: "Action Failed",
        description: "Failed to save vehicle. Please try again.",
      });
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return {
    isEditMode,
    images,
    setImages,
    loading,
    showConfirm,
    setShowConfirm,
    vehicleStatus,
    messageModal,
    setMessageModal,
    form,
    handleChange,
    handleSubmit,
    handleConfirmSubmit,
  };
}
