import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function useVehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  const [showAuth, setShowAuth] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null);

  const isAdmin = user?.role === "ADMIN";
  const isOwner = user?.role === "OWNER";
  const isRenter = user?.role === "RENTER";
  const isGuest = !user;

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
  }, [id, isAdmin, isOwner, navigate, location.state]);

  useEffect(() => {
    setIsAvailable(false);
    setAvailabilityError("");
  }, [startDate, endDate]);

  const approveVehicle = async () => {
    try {
      setActionLoading(true);
      const res = await api.put(`/vehicles/${vehicle._id}/approve`);
      setVehicle(res.data);
    } finally {
      setActionLoading(false);
      setConfirmOpen(false);
    }
  };

  const rejectVehicle = async () => {
    try {
      setActionLoading(true);
      const res = await api.put(`/vehicles/${vehicle._id}/reject`);
      setVehicle(res.data);
    } finally {
      setActionLoading(false);
      setConfirmOpen(false);
    }
  };

  const checkAvailability = async () => {
    if (!startDate || !endDate) {
      setAvailabilityError("Please select both start and end dates");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setAvailabilityError("Start date cannot be in the past");
      return;
    }

    if (start > end) {
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

  return {
    vehicle,
    loading,
    actionLoading,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    checkingAvailability,
    isAvailable,
    availabilityError,
    showAuth,
    setShowAuth,
    confirmOpen,
    confirmType,
    setConfirmOpen,
    setConfirmType,
    approveVehicle,
    rejectVehicle,
    checkAvailability,
    handleBookNow,
    isAdmin,
    isOwner,
    isRenter,
    isGuest,
  };
}
