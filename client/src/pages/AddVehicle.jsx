import { useNavigate } from "react-router-dom";
import ImageUpload from "../components/ImageUpload";
import ConfirmModal from "../components/ConfirmModal";
import BackButton from "../components/BackButton";
import useAddVehicle from "../hooks/useAddVehicle";

const inputClass =
  "w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

export default function AddVehicle() {
  const navigate = useNavigate();

  const {
    isEditMode,
    images,
    setImages,
    loading,
    showConfirm,
    setShowConfirm,
    vehicleStatus,
    messageModal,
    setMessageModal,
    form,
    handleChange,
    handleSubmit,
    handleConfirmSubmit,
  } = useAddVehicle();

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 pt-16">
      <BackButton to="/dashboard/owner" className="mt-4" />

      <h1 className="text-3xl font-bold mb-6">
        {isEditMode ? "Edit Vehicle" : "Add New Vehicle"}
      </h1>

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
                value={form.make}
                onChange={handleChange}
                disabled={isEditMode}
                placeholder="e.g. Hyundai"
                className={inputClass}
              />

              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                disabled={isEditMode}
                placeholder="e.g. Creta"
                className={inputClass}
              />

              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                disabled={isEditMode}
                placeholder="e.g. 2022"
                className={inputClass}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <select
                name="fuelType"
                value={form.fuelType}
                onChange={handleChange}
                disabled={vehicleStatus === "approved"}
                className={inputClass}
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
                value={form.kilometersDriven}
                onChange={handleChange}
                placeholder="Total kilometers driven"
                required
                className={inputClass}
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
                value={form.vehicleType}
                onChange={handleChange}
                disabled={vehicleStatus === "approved"}
                className={inputClass}
              >
                <option value="">Select vehicle type</option>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="suv">SUV</option>
              </select>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                disabled={vehicleStatus === "approved"}
                className={inputClass}
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
                value={form.location}
                onChange={handleChange}
                disabled={vehicleStatus === "approved"}
                placeholder="e.g. Bangalore"
                className={inputClass}
              />

              <input
                type="number"
                name="pricePerDay"
                value={form.pricePerDay}
                onChange={handleChange}
                disabled={vehicleStatus === "approved"}
                placeholder="Price per day (₹)"
                className={inputClass}
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
              value={form.description}
              onChange={handleChange}
              disabled={vehicleStatus === "approved"}
              placeholder="Brief description of the vehicle"
              className={inputClass}
            />
          </section>

          {/* Images */}
          <section>
            <h2 className="text-lg font-semibold mb-4">
              Vehicle Images
            </h2>

            {isEditMode ? (
              <div className="grid grid-cols-3 gap-4">
                {images.map((img) => (
                  <img
                    key={img}
                    src={img}
                    alt=""
                    className="rounded-lg h-28 object-cover"
                  />
                ))}
              </div>
            ) : (
              <ImageUpload images={images} setImages={setImages} />
            )}
          </section>

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
              {isEditMode ? "Update Vehicle" : "Submit Vehicle"}
            </button>
          </div>
        </form>
      </div>

      {/* CONFIRM SUBMIT */}
      <ConfirmModal
        open={showConfirm}
        title={
          isEditMode
            ? "Update vehicle?"
            : "Submit vehicle for approval?"
        }
        description={
          isEditMode
            ? "Changes will be saved immediately."
            : "Once submitted, this vehicle will be reviewed by the admin."
        }
        confirmText={isEditMode ? "Update" : "Submit"}
        loading={loading}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirm(false)}
      />

      {/* MESSAGE MODAL */}
      <ConfirmModal
        open={messageModal.open}
        title={messageModal.title}
        description={messageModal.description}
        confirmText="OK"
        onConfirm={() => {
          setMessageModal({ ...messageModal, open: false });
          navigate("/dashboard/owner");
        }}
        onCancel={() =>
          setMessageModal({ ...messageModal, open: false })
        }
      />
    </div>
  );
}
