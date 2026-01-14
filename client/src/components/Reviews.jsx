import { useEffect, useState } from "react";
import { getVehicleReviews, addReview } from "../api/reviewApi";
import { useAuth } from "../context/AuthContext";

export default function Reviews({ vehicleId, bookingId, singleReview }) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const fetchReviews = async () => {
    try {
      if (vehicleId) {
        const res = await getVehicleReviews(vehicleId);
        setReviews(res.data || []);
      }
    } catch {
      console.error("Failed to load reviews");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [vehicleId]);

  const visibleReviews = reviews.filter((r) => !r.isHidden);
  const totalReviews = visibleReviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          visibleReviews.reduce((sum, r) => sum + r.rating, 0) /
          totalReviews
        ).toFixed(1)
      : 0;

  const existingReview = bookingId
    ? reviews.find((r) => r.bookingId === bookingId)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      alert("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      await addReview({ bookingId, rating, comment });
      setRating(0);
      setComment("");
      setShowForm(false);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const Star = ({ filled, onClick }) => (
    <span
      onClick={onClick}
      className={`cursor-pointer text-2xl ${
        filled ? "text-yellow-400" : "text-gray-300"
      }`}
    >
      ★
    </span>
  );

  return (
    <section className="mt-6">
      <h3 className="text-lg font-semibold mb-1">Reviews</h3>

      {totalReviews > 0 && (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-700">
          <span className="text-yellow-500 font-semibold">
            ⭐ {averageRating}
          </span>
          <span>
            ({totalReviews} review{totalReviews > 1 ? "s" : ""})
          </span>
        </div>
      )}

      {totalReviews === 0 && (
        <p className="text-sm text-gray-500 mb-3">
          {user?.role === "RENTER"
            ? "No reviews yet. Be the first one to review it."
            : "No reviews yet."}
        </p>
      )}

      {existingReview && (
        <>
          <div className="text-xs text-green-600 font-medium mb-2">
            ✔ You already reviewed this rental
          </div>

          <div className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between mb-1">
              <span className="font-medium">
                {existingReview.renterId?.name || "You"}
              </span>
              <span className="text-yellow-500">
                ⭐ {existingReview.rating}/5
              </span>
            </div>

            {existingReview.comment && (
              <p className="text-sm text-gray-600">
                {existingReview.comment}
              </p>
            )}

            <p className="text-xs text-gray-400 mt-1">
              {new Date(existingReview.createdAt).toLocaleDateString()}
            </p>
          </div>
        </>
      )}

      {!existingReview &&
        user?.role === "RENTER" &&
        bookingId && (
          <>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                ➕ Add your review
              </button>
            )}

            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="border rounded-lg p-4 bg-gray-50 mt-3"
              >
                <h4 className="font-medium mb-2">
                  Share your experience
                </h4>

                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      filled={i <= rating}
                      onClick={() => setRating(i)}
                    />
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Write something (optional)"
                  className="border p-2 w-full rounded resize-none"
                />

                <div className="flex gap-3 mt-3">
                  <button
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        )}

      {!singleReview && reviews.length > 0 && (
        <div className="mt-6 space-y-3">
          {reviews
            .filter((r) => r.bookingId !== bookingId && !r.isHidden)
            .map((r) => (
              <div
                key={r._id}
                className="border rounded-lg p-3 bg-white"
              >
                <div className="flex justify-between mb-1">
                  <span className="font-medium">
                    {r.renterId?.name || "User"}
                  </span>
                  <span className="text-yellow-500">
                    ⭐ {r.rating}/5
                  </span>
                </div>

                {r.comment && (
                  <p className="text-sm text-gray-600">
                    {r.comment}
                  </p>
                )}

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
        </div>
      )}
    </section>
  );
}
