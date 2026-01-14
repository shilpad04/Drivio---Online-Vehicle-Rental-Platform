import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import BackButton from "../../components/BackButton";

export default function AdminUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

    useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [user, debouncedSearch, role]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (role) params.role = role;

      const res = await api.get("/admin/users", { params });
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <BackButton to="/dashboard/admin" />
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-4 py-2 text-sm w-full md:w-1/2"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border rounded px-4 py-2 text-sm w-full md:w-1/4"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="OWNER">OWNER</option>
          <option value="RENTER">RENTER</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3 font-medium">{u.role}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      navigate(`/dashboard/admin/users/${u._id}`)
                    }
                    className="text-blue-600 font-medium hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
