import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ratingFilter, setRatingFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, ratingFilter, visibilityFilter, search]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reviews/admin");
      setReviews(res.data || []);
      setFilteredReviews(res.data || []);
    } catch {
      console.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const hideReview = async (id) => {
    await api.patch(`/reviews/${id}/hide`);
    fetchAllReviews();
  };

  const unhideReview = async (id) => {
    await api.patch(`/reviews/${id}/unhide`);
    fetchAllReviews();
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    await api.delete(`/reviews/${id}`);
    fetchAllReviews();
  };

  const applyFilters = () => {
    let data = [...reviews];

    if (ratingFilter !== "all") {
      data = data.filter(
        (r) => Number(r.rating) === Number(ratingFilter)
      );
    }

    if (visibilityFilter !== "all") {
      data = data.filter((r) =>
        visibilityFilter === "hidden"
          ? r.isHidden === true
          : r.isHidden !== true
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      data = data.filter((r) => {
        const comment = (r.comment || "").toLowerCase();
        const vehicleMake = (r.vehicleId?.make || "").toLowerCase();
        const vehicleModel = (r.vehicleId?.model || "").toLowerCase();
        const renterName = (r.renterId?.name || "").toLowerCase();
        const renterEmail = (r.renterId?.email || "").toLowerCase();

        return (
          comment.includes(q) ||
          vehicleMake.includes(q) ||
          vehicleModel.includes(q) ||
          renterName.includes(q) ||
          renterEmail.includes(q)
        );
      });
    }

    setFilteredReviews(data);
  };

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate("/dashboard/admin")}
        className="mb-6 text-sm text-blue-600 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">
        All Ratings & Reviews
      </h1>

      {/* FILTERS */}
      <div className="bg-white rounded-xl shadow p-4 mb-8 grid gap-4 grid-cols-1 md:grid-cols-4">
        <input
          type="text"
          placeholder="Search review / vehicle / renter"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              ⭐ {r}
            </option>
          ))}
        </select>

        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">All Visibility</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      {filteredReviews.length === 0 ? (
        <p className="text-gray-600 text-center">
          No reviews match the filters.
        </p>
      ) : (
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onHide={hideReview}
              onUnhide={unhideReview}
              onDelete={deleteReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =====================================
   REVIEW CARD (ADMIN)
===================================== */

function ReviewCard({ review, onHide, onUnhide, onDelete }) {
  const {
    _id,
    rating,
    comment,
    createdAt,
    vehicleId,
    renterId,
    isHidden,
  } = review;

  return (
    <div
      className={`rounded-xl shadow p-6 space-y-4 ${
        isHidden ? "bg-gray-100 opacity-70" : "bg-white"
      }`}
    >
      <div>
        <h2 className="font-semibold text-lg">
          {vehicleId?.make} {vehicleId?.model}
        </h2>
        <p className="text-sm text-gray-600">
          {vehicleId?.location} • {vehicleId?.category}
        </p>
      </div>

      {vehicleId?.ownerId && (
        <div className="text-sm">
          <p className="font-medium text-gray-700">Owner</p>
          <p>{vehicleId.ownerId.name}</p>
          <p className="text-gray-500">
            {vehicleId.ownerId.email}
          </p>
        </div>
      )}

      {renterId && (
        <div className="text-sm">
          <p className="font-medium text-gray-700">Renter</p>
          <p>{renterId.name}</p>
          <p className="text-gray-500">{renterId.email}</p>
        </div>
      )}

      <div className="border-t pt-4">
        <span className="text-yellow-500 font-semibold">
          ⭐ {rating} / 5
        </span>

        {comment && (
          <p className="text-gray-700 text-sm mt-1">{comment}</p>
        )}

        <p className="text-xs text-gray-400 mt-2">
          {new Date(createdAt).toLocaleDateString("en-IN")}
        </p>
      </div>

      <div className="flex gap-3 pt-3 border-t">
        {!isHidden ? (
          <button
            onClick={() => onHide(_id)}
            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded"
          >
            Hide
          </button>
        ) : (
          <button
            onClick={() => onUnhide(_id)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded"
          >
            Unhide
          </button>
        )}

        <button
          onClick={() => onDelete(_id)}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
