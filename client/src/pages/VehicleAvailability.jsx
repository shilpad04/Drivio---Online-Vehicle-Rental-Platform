import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function VehicleAvailability() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const { startDate, endDate } = state || {};

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  // PREPARE PAYMENT
  useEffect(() => {
    if (!startDate || !endDate) {
      navigate("/vehicles");
      return;
    }

    const preparePayment = async () => {
      try {
        const res = await api.post("/payments/prepare", {
          vehicleId: id,
          startDate,
          endDate,
        });

        setSummary(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Vehicle not available for selected dates"
        );
      } finally {
        setLoading(false);
      }
    };

    preparePayment();
  }, [id, startDate, endDate, navigate]);

  // START PAYMENT
  const startPayment = async () => {
    if (!summary) return;

    try {
      setPaying(true);
      setError("");

      // 1️ Create Razorpay order
      const res = await api.post("/payments/create-order", {
        vehicleId: id,
        amount: summary.totalAmount,
      });

      const { orderId, key, currency } = res.data;

      // 2️ Razorpay options
      const options = {
        key,
        amount: summary.totalAmount * 100,
        currency,
        name: "Online Vehicle Rental System",
        description: "Vehicle Booking Payment",
        order_id: orderId,

        handler: async function (response) {
          try {
            // 3️ Verify payment
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              vehicleId: id,
              startDate,
              endDate,
            });

            navigate("/dashboard/renter");
          } catch {
            setError("Payment verification failed");
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to initiate payment"
      );
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 text-center">
        Loading...
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="min-h-screen pt-32 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
      >
        <i className="fa-solid fa-arrow-left"></i>
        Back
      </button>

      <h1 className="text-2xl font-bold mb-6">
        Booking Summary
      </h1>

      <div className="border rounded-lg p-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">
          {summary.vehicleSummary.make}{" "}
          {summary.vehicleSummary.model}
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          {startDate} → {endDate}
        </p>

        <div className="space-y-1 mb-6">
          <p>
            Days: <strong>{summary.days}</strong>
          </p>
          <p>Price per day: ₹{summary.pricePerDay}</p>
          <p className="text-lg font-semibold text-blue-600">
            Total Amount: ₹{summary.totalAmount}
          </p>
        </div>

        {error && (
          <p className="text-red-500 mb-4">
            {error}
          </p>
        )}

        <button
          onClick={startPayment}
          disabled={paying}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {paying
            ? "Processing Payment..."
            : "Pay with Razorpay"}
        </button>
      </div>
    </div>
  );
}
