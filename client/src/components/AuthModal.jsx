import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }) {
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome to <span className="text-blue-600">Drivio</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Rent or list vehicles effortlessly
          </p>
        </div>

        <div className="flex mb-6 border-b">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2 font-semibold ${
              tab === "login"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-400"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-2 font-semibold ${
              tab === "register"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-400"
            }`}
          >
            Register
          </button>
        </div>

        {tab === "login" ? (
          <LoginForm onClose={onClose} />
        ) : (
          <RegisterForm onClose={onClose} />
        )}
      </div>
    </div>
  );
}

/* =======================
   LOGIN FORM (CONNECTED)
======================= */
function LoginForm({ onClose }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(email, password);
      onClose();

      if (user.role === "RENTER") navigate("/");
      if (user.role === "OWNER") navigate("/dashboard/owner");
      if (user.role === "ADMIN") navigate("/dashboard/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input
        type="email"
        placeholder="Email address"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded-lg px-4 py-2"
      />

      <input
        type="password"
        placeholder="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded-lg px-4 py-2"
      />

      <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">
        Login
      </button>
    </form>
  );
}

/* =========================
   REGISTER FORM (CONNECTED)
========================= */
function RegisterForm({ onClose }) {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "RENTER",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await register(form);
      onClose();

      if (user.role === "RENTER") navigate("/");
      if (user.role === "OWNER") navigate("/dashboard/owner");
      if (user.role === "ADMIN") navigate("/dashboard/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input
        type="text"
        placeholder="Full name"
        required
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border rounded-lg px-4 py-2"
      />

      <input
        type="email"
        placeholder="Email address"
        required
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full border rounded-lg px-4 py-2"
      />

      <input
        type="password"
        placeholder="Password"
        required
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="w-full border rounded-lg px-4 py-2"
      />

      <select
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        className="w-full border rounded-lg px-4 py-2"
      >
        <option value="RENTER">Renter</option>
        <option value="OWNER">Vehicle Owner</option>
      </select>

      <button className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold">
        Create Account
      </button>
    </form>
  );
}
