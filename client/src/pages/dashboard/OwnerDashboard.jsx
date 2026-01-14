import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import DashboardTile from "../../components/DashboardTile";
import AnalyticsCard from "../../components/AnalyticsCard";

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/analytics/owner/overview").then((res) => {
      setData(res.data);
    });
  }, []);

  if (!data) {
    return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Owner Dashboard</h1>

        <Link
          to="/dashboard/owner/vehicles/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + Add Vehicle
        </Link>
      </div>

      {/* Tiles */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardTile
          title="Analytics"
          value="View"
          color="bg-gray-800"
          icon="fa-chart-line"
          onClick={() => setShowAnalytics((p) => !p)}
        />

        <DashboardTile
          title="Bookings"
          value="View"
          color="bg-green-600"
          icon="fa-calendar-check"
          onClick={() => navigate("/dashboard/owner/bookings")}
        />

        <DashboardTile
          title="My Vehicles"
          value="View"
          color="bg-indigo-600"
          icon="fa-car"
          onClick={() => navigate("/vehicles/my")}
        />

        <DashboardTile
          title="Reviews"
          value="View"
          color="bg-yellow-500"
          icon="fa-star"
          onClick={() => navigate("/dashboard/owner/reviews")}
        />
      </div>

      {showAnalytics && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Analytics Overview</h2>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <AnalyticsCard
              title="Vehicles"
              items={[
                { label: "Total", value: data.vehicles.total },
                { label: "Approved", value: data.vehicles.approved },
                { label: "Pending", value: data.vehicles.pending },
              ]}
            />

            <AnalyticsCard
              title="Bookings"
              items={[
                { label: "Total", value: data.bookings.total },
                { label: "Active", value: data.bookings.active },
                { label: "Cancelled", value: data.bookings.cancelled },
                { label: "Completed", value: data.bookings.completed },
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
