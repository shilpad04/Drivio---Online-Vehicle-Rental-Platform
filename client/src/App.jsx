import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Landing from "./pages/Landing";
import Vehicles from "./pages/Vehicles";
import VehicleDetails from "./pages/VehicleDetails";
import VehicleAvailability from "./pages/VehicleAvailability";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Dashboards
import OwnerDashboard from "./pages/dashboard/OwnerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import RenterDashboard from "./pages/dashboard/RenterDashboard";

// Pages
import VehicleBookings from "./pages/VehicleBookings";
import RentalHistory from "./pages/RentalHistory";
import Payments from "./pages/Payments";

// Owner
import AddVehicle from "./pages/AddVehicle";

// Reviews
import AdminReviews from "./pages/dashboard/AdminReviews";
import OwnerReviews from "./pages/dashboard/OwnerReviews";

// Profile
import UserProfile from "./pages/UserProfile";

// Admin – Support
import AdminInquiries from "./pages/dashboard/AdminInquiries";

// ADMIN – USER MANAGEMENT
import AdminUsers from "./pages/dashboard/AdminUsers";
import AdminUserDetails from "./pages/dashboard/AdminUserDetails";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <Routes>
        {/* LANDING */}
        <Route
          path="/"
          element={
            !user || user.role === "RENTER" ? (
              <Landing
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            ) : (
              <Navigate
                to={
                  user.role === "OWNER"
                    ? "/dashboard/owner"
                    : "/dashboard/admin"
                }
                replace
              />
            )
          }
        />

        {/* VEHICLES */}
        <Route
          path="/vehicles"
          element={<Vehicles searchQuery={searchQuery} />}
        />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />

        <Route
          path="/vehicles/:id/availability"
          element={
            <ProtectedRoute allowedRoles={["RENTER"]}>
              <VehicleAvailability />
            </ProtectedRoute>
          }
        />

        {/* STATIC */}
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* DASHBOARDS */}
        <Route
          path="/dashboard/owner"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/renter"
          element={
            <ProtectedRoute allowedRoles={["RENTER"]}>
              <RenterDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN – USER MANAGEMENT */}
        <Route
          path="/dashboard/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/users/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminUserDetails />
            </ProtectedRoute>
          }
        />

        {/* ADMIN – SUPPORT INQUIRIES */}
        <Route
          path="/dashboard/admin/inquiries"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminInquiries />
            </ProtectedRoute>
          }
        />

        {/* BOOKINGS */}
        <Route
          path="/dashboard/renter/bookings"
          element={
            <ProtectedRoute allowedRoles={["RENTER"]}>
              <VehicleBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/owner/bookings"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <VehicleBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <VehicleBookings />
            </ProtectedRoute>
          }
        />

        {/* PAYMENTS */}
        <Route
          path="/dashboard/admin/payments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Payments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/renter/payments"
          element={
            <ProtectedRoute allowedRoles={["RENTER"]}>
              <Payments />
            </ProtectedRoute>
          }
        />

        {/* RENTAL HISTORY */}
        <Route
          path="/dashboard/renter/rentals"
          element={
            <ProtectedRoute allowedRoles={["RENTER"]}>
              <RentalHistory />
            </ProtectedRoute>
          }
        />

        {/* REVIEWS */}
        <Route
          path="/dashboard/admin/reviews"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminReviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/owner/reviews"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <OwnerReviews />
            </ProtectedRoute>
          }
        />

        {/* OWNER */}
        <Route
          path="/owner/add-vehicle"
          element={
            <ProtectedRoute allowedRoles={["OWNER"]}>
              <AddVehicle />
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "OWNER", "RENTER"]}>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
