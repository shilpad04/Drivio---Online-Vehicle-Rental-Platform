import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import DashboardTile from "../../components/DashboardTile";
import AnalyticsCard from "../../components/AnalyticsCard";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/analytics/admin/overview").then((res) => {
      setData(res.data);
    });
  }, []);

  if (!data) {
    return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

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
          onClick={() => navigate("/dashboard/admin/bookings")}
        />

        <DashboardTile
          title="Payments"
          value="View"
          color="bg-purple-600"
          icon="fa-credit-card"
          onClick={() => navigate("/dashboard/admin/payments")}
        />

        <DashboardTile
          title="Ratings & Reviews"
          value="View"
          color="bg-yellow-600"
          icon="fa-star"
          onClick={() => navigate("/dashboard/admin/reviews")}
        />

        <DashboardTile
          title="Support Inquiries"
          value="Manage"
          color="bg-red-600"
          icon="fa-headset"
          onClick={() => navigate("/dashboard/admin/inquiries")}
        />

        <DashboardTile
          title="Users"
          value="View"
          color="bg-blue-600"
          icon="fa-users"
          onClick={() => navigate("/dashboard/admin/users")}
        />

        <DashboardTile
          title="Vehicles"
          value="View"
          color="bg-indigo-600"
          icon="fa-car"
          onClick={() => navigate("/vehicles?view=admin")}
        />
      </div>

      {showAnalytics && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Analytics Overview</h2>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <AnalyticsCard
              title="Users"
              items={[
                { label: "Total", value: data.users.total },
                { label: "Owners", value: data.users.owners },
                { label: "Renters", value: data.users.renters },
              ]}
            />

            <AnalyticsCard
              title="Vehicles"
              items={[
                { label: "Total", value: data.vehicles.total },
                { label: "Approved", value: data.vehicles.approved },
                { label: "Pending", value: data.vehicles.pending },
                { label: "Rejected", value: data.vehicles.rejected },
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
