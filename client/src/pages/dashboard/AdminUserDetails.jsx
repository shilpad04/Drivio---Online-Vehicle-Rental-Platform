import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      api
        .get(`/admin/users/${id}`)
        .then((res) => setData(res.data))
        .finally(() => setLoading(false));
    }
  }, [id, user]);

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen pt-32 text-center text-red-600">
        Access Denied
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  }

  if (!data) {
    return <div className="min-h-screen pt-32 text-center">User not found</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-xl mx-auto">
      <button
        onClick={() => navigate("/dashboard/admin/users")}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
      >
        <i className="fa-solid fa-arrow-left"></i>
        Back
      </button>

      <div className="bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold mb-6">User Details</h1>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-semibold">{data.name}</p>
          </div>

          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-semibold">{data.email}</p>
          </div>

          <div>
            <p className="text-gray-500">Role</p>
            <p className="font-semibold">{data.role}</p>
          </div>

          <div>
            <p className="text-gray-500">Joined</p>
            <p className="font-semibold">
              {new Date(data.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
