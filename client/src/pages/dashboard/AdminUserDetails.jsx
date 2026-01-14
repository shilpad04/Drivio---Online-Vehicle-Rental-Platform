import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../../components/ConfirmModal";
import UserForm from "../../components/UserForm";

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adminCount, setAdminCount] = useState(0);

  const isSelf = user?.id === id;
  const isLastAdmin = data?.role === "ADMIN" && adminCount === 1;

  useEffect(() => {
    if (user?.role !== "ADMIN") return;

    Promise.all([
      api.get(`/admin/users/${id}`),
      api.get("/admin/users?role=ADMIN"),
    ])
      .then(([userRes, adminRes]) => {
        setData(userRes.data);
        setForm({
          name: userRes.data.name,
          email: userRes.data.email,
          role: userRes.data.role,
        });
        setAdminCount(adminRes.data.length);
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {
      name: form.name,
      email: form.email,
    };

    if (!isSelf) {
      payload.role = form.role;
    }

    try {
      await api.put(`/admin/users/${id}`, payload);
      setMessage("User updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      await api.delete(`/admin/users/${id}`);
      navigate("/dashboard/admin/users");
    } catch {
      setError("Failed to delete user");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
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

        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <UserForm form={form} onChange={handleChange} onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={isSelf}
              className="w-full border px-4 py-2 rounded disabled:bg-gray-100"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="OWNER">OWNER</option>
              <option value="RENTER">RENTER</option>
            </select>
            {isSelf && (
              <p className="text-xs text-gray-500 mt-1">
                You cannot change your own role
              </p>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update User"}
            </button>

            <button
              type="button"
              disabled={isSelf || isLastAdmin}
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              Delete User
            </button>
          </div>

          {isSelf && (
            <p className="text-xs text-gray-500 mt-2">
              You cannot delete your own account
            </p>
          )}

          {isLastAdmin && (
            <p className="text-xs text-gray-500 mt-2">
              At least one admin must remain
            </p>
          )}
        </UserForm>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete User"
        description="This action cannot be undone. Are you sure you want to delete this user?"
        confirmText="Delete"
        danger
        loading={deleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
