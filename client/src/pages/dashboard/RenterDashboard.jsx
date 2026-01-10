import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import DashboardTile from "../../components/DashboardTile";
import AnalyticsCard from "../../components/AnalyticsCard";

export default function RenterDashboard() {
  const [data, setData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/analytics/renter/overview").then((res) => {
      setData(res.data);
    });
  }, []);

  if (!data) {
    return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Renter Dashboard</h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardTile
          title="Analytics"
          value="View"
          color="bg-gray-800"
          icon="fa-chart-line"
          onClick={() => setShowAnalytics((p) => !p)}
        />

        <DashboardTile
          title="My Bookings"
          value="View"
          color="bg-blue-600"
          icon="fa-calendar-day"
          onClick={() => navigate("/dashboard/renter/bookings")}
        />

        <DashboardTile
          title="Rental History"
          value="View"
          color="bg-green-600"
          icon="fa-clock-rotate-left"
          onClick={() => navigate("/dashboard/renter/rentals")}
        />

        <DashboardTile
          title="Payment History"
          value="View"
          color="bg-indigo-600"
          icon="fa-credit-card"
          onClick={() => navigate("/dashboard/renter/payments")}
        />
      </div>

      {showAnalytics && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Analytics Overview</h2>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <AnalyticsCard
              title="Bookings"
              items={[
                { label: "Total", value: data.bookings.total },
                { label: "Active", value: data.bookings.active },
                { label: "Cancelled", value: data.bookings.cancelled },
                { label: "Completed", value: data.bookings.completed },
              ]}
            />

            <AnalyticsCard
              title="Rentals"
              items={[
                {
                  label: "Completed Rentals",
                  value: data.rentals.completed,
                },
              ]}
            />

            <AnalyticsCard
              title="Reviews"
              items={[
                {
                  label: "Reviews Given",
                  value: data.reviews.given,
                },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
