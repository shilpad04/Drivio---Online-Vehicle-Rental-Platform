import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { paginate } from "../utils/pagination";
import { exportCSV } from "../utils/exportCSV";
import { formatDate } from "../utils/formatDate";

export default function useVehicleBookings(ITEMS_PER_PAGE) {
  const { user } = useAuth();
  const role = user?.role;
  const location = useLocation();

  const isRenterHistory =
    role === "RENTER" &&
    location.pathname.includes("/dashboard/renter/rentals");

  const [bookings, setBookings] = useState([]);
  const [paymentMap, setPaymentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, location.pathname, debouncedSearch]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      let url = "";
      if (role === "RENTER") url = "/bookings/my";
      if (role === "OWNER") url = "/bookings/view/owner";
      if (role === "ADMIN") url = "/bookings/view/admin";

      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await api.get(url, { params });
      let data = res.data || [];

      if (isRenterHistory) {
        data = data.filter((b) => b.status === "COMPLETED");
      }

      setBookings(data);

      if (role === "OWNER") {
        try {
          const paymentRes = await api.get("/payments/owner");
          const map = {};

          paymentRes.data.forEach((p) => {
            if (!p.amount || !p.booking) return;

            const bookingId =
              typeof p.booking === "object"
                ? p.booking._id?.toString()
                : p.booking.toString();

            if (bookingId) {
              map[bookingId] = p.amount;
            }
          });

          setPaymentMap(map);
        } catch {
          setPaymentMap({});
        }
      }
    } catch {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings =
    statusFilter === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  const { totalPages, paginatedItems: paginatedBookings } = paginate(
    filteredBookings,
    currentPage,
    ITEMS_PER_PAGE
  );

  const exportCSVFile = () => {
    if (role !== "ADMIN") return;

    const headers = [
      "Vehicle",
      "Fuel Type",
      "Kilometers Driven",
      "Start Date",
      "End Date",
      "Status",
      "Renter Name",
      "Renter Email",
    ];

    const rows = bookings.map((b) => [
      `${b.vehicle?.make || ""} ${b.vehicle?.model || ""}`,
      b.vehicle?.fuelType || "",
      b.vehicle?.kilometersDriven ?? "",
      formatDate(b.startDate),
      formatDate(b.endDate),
      b.status,
      b.renter?.name || "",
      b.renter?.email || "",
    ]);

    exportCSV({
      headers,
      rows,
      fileName: "bookings-admin.csv",
    });
  };

  return {
    bookings,
    paymentMap,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedBookings,
    isRenterHistory,
    exportCSVFile,
    refreshBookings: fetchBookings,
  };
}
