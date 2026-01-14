import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import UserForm from "../components/UserForm";
import ConfirmModal from "../components/ConfirmModal";

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      setForm({
        name: res.data.name || "",
        email: res.data.email || "",
        password: "",
        role: res.data.role || "",
      });
    } catch {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        name: form.name,
        email: form.email,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      await api.put("/users/profile", payload);
      setMessage("Profile updated successfully");
      setForm({ ...form, password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (user?.role === "ADMIN") {
      setError("Admin accounts cannot be deleted");
      setShowDeleteModal(false);
      return;
    }

    setDeleting(true);
    try {
      await api.delete("/users/profile");
      logout();
      navigate("/");
    } catch {
      setError("Failed to delete account");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const goBackToDashboard = () => {
    if (user.role === "ADMIN") navigate("/dashboard/admin");
    if (user.role === "OWNER") navigate("/dashboard/owner");
    if (user.role === "RENTER") navigate("/dashboard/renter");
  };

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading…</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 text-center text-red-600">{error}</div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={goBackToDashboard}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Back
        </button>

        <div className="flex justify-center">
          <div className="w-full max-w-xl bg-white rounded-xl shadow p-8">
            <h1 className="text-2xl font-bold mb-8">My Profile</h1>

            {message && <p className="text-green-600 mb-4">{message}</p>}
            {error && <p className="text-red-600 mb-4">{error}</p>}

            {user?.role === "ADMIN" && (
              <p className="mb-4 text-sm text-gray-500">
                Admin accounts cannot be deleted for security reasons.
              </p>
            )}

            <UserForm
              form={form}
              onChange={handleChange}
              onSubmit={handleSubmit}
              loading={saving}
              showRole={false}
            >
              <div>
                <label className="block mb-1 font-medium">Role</label>
                <div className="w-full border px-4 py-2 rounded bg-gray-100 text-gray-700">
                  {form.role}
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">New Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  className="w-full border px-4 py-2 rounded"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Update Profile
                </button>

                {user?.role !== "ADMIN" && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                  >
                    Delete My Account
                  </button>
                )}
              </div>
            </UserForm>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete Account"
        description="This action cannot be undone. Are you sure you want to delete your account?"
        confirmText="Delete"
        danger
        loading={deleting}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
