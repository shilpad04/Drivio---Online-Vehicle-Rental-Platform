import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addVehicle } from "../api/vehicleApi";
import ImageUpload from "../components/ImageUpload";
import ConfirmModal from "../components/ConfirmModal";

const inputClass =
  "w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

export default function AddVehicle() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    vehicleType: "",
    category: "",
    fuelType: "",          // ✅ ADDED
    kilometersDriven: "",  // ✅ ADDED
    location: "",
    pricePerDay: "",
    description: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setLoading(true);

      await addVehicle({
        ...form,
        year: Number(form.year),
        pricePerDay: Number(form.pricePerDay),
        kilometersDriven: Number(form.kilometersDriven), // ✅ ADDED
        images,
      });

      alert("Vehicle submitted for admin approval");
      navigate("/dashboard/owner");
    } catch (error) {
      console.error("Add vehicle failed:", error);
      alert("Failed to submit vehicle. Please try again.");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* BACK */}
      <button
        onClick={() => navigate("/dashboard/owner")}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
      >
        <i className="fa-solid fa-arrow-left"></i>
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6">Add New Vehicle</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Vehicle Information */}
          <section>
            <h2 className="text-lg font-semibold mb-4">
              Vehicle Information
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <input
                name="make"
                placeholder="e.g. Hyundai"
                required
                className={inputClass}
                onChange={handleChange}
              />

              <input
                name="model"
                placeholder="e.g. Creta"
                required
                className={inputClass}
                onChange={handleChange}
              />

              <input
                type="number"
                name="year"
                placeholder="e.g. 2022"
                required
                className={inputClass}
                onChange={handleChange}
              />
            </div>

            {/* ✅ Fuel Type & KM Driven (ONLY ADDITION) */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <select
                name="fuelType"
                required
                className={inputClass}
                onChange={handleChange}
              >
                <option value="">Select fuel type</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="cng">CNG</option>
                <option value="hybrid">Hybrid</option>
              </select>

              <input
                type="number"
                name="kilometersDriven"
                placeholder="Kilometers driven"
                required
                className={inputClass}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Category & Type */}
          <section>
            <h2 className="text-lg font-semibold mb-4">
              Category & Type
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <select
                name="vehicleType"
                required
                className={inputClass}
                onChange={handleChange}
              >
                <option value="">Select vehicle type</option>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="suv">SUV</option>
              </select>

              <select
                name="category"
                required
                className={inputClass}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                <option value="economy">Economy</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </section>

          {/* Pricing & Location */}
          <section>
            <h2 className="text-lg font-semibold mb-4">
              Pricing & Location
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                name="location"
                placeholder="e.g. Bangalore"
                required
                className={inputClass}
                onChange={handleChange}
              />

              <input
                type="number"
                name="pricePerDay"
                placeholder="Price per day (₹)"
                required
                className={inputClass}
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Description */}
          <section>
            <h2 className="text-lg font-semibold mb-4">
              Description
            </h2>

            <textarea
              name="description"
              rows="4"
              placeholder="Brief description of the vehicle"
              className={inputClass}
              onChange={handleChange}
            />
          </section>

          {/* Images */}
          <section>
            <h2 className="text-lg font-semibold mb-4">
              Vehicle Images
            </h2>

            <ImageUpload images={images} setImages={setImages} />
          </section>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-2.5 rounded-md font-medium text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Submit Vehicle
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        open={showConfirm}
        title="Submit vehicle for approval?"
        description="Once submitted, this vehicle will be reviewed by the admin before it becomes visible to renters."
        confirmText="Yes, submit"
        cancelText="Cancel"
        loading={loading}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
