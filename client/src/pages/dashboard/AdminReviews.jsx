import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { paginate } from "../../utils/pagination";
import ConfirmModal from "../../components/ConfirmModal";

const ITEMS_PER_PAGE = 6;

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ratingFilter, setRatingFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      setCurrentPage(1);
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

  const deleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/reviews/${reviewToDelete}`);
      setConfirmOpen(false);
      setReviewToDelete(null);
      fetchAllReviews();
    } finally {
      setDeleting(false);
    }
  };

  const applyFilters = () => {
    let data = [...reviews];

    if (ratingFilter !== "all") {
      data = data.filter((r) => Number(r.rating) === Number(ratingFilter));
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
    setCurrentPage(1);
  };

  const { totalPages, paginatedItems: paginatedReviews } = paginate(
    filteredReviews,
    currentPage,
    ITEMS_PER_PAGE
  );

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate("/dashboard/admin")}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
      >
        <i className="fa-solid fa-arrow-left"></i>
        Back
      </button>

      <h1 className="text-2xl font-bold mb-6">All Ratings & Reviews</h1>

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

      <div className="space-y-6">
        {paginatedReviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            onHide={hideReview}
            onUnhide={unhideReview}
            onAskDelete={(id) => {
              setReviewToDelete(id);
              setConfirmOpen(true);
            }}
          />
        ))}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete Review"
        description="This action is permanent and cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        danger
        loading={deleting}
        onCancel={() => {
          setConfirmOpen(false);
          setReviewToDelete(null);
        }}
        onConfirm={deleteReview}
      />

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 text-sm border rounded disabled:opacity-40"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 text-sm border rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 text-sm border rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review, onHide, onUnhide, onAskDelete }) {
  const navigate = useNavigate();
  const { _id, rating, comment, createdAt, vehicleId, isHidden } = review;

  return (
    <div
      className={`rounded-xl shadow p-6 space-y-4 ${
        isHidden ? "bg-gray-100 opacity-70" : "bg-white"
      }`}
    >
      <div className="flex gap-4">
        <div className="w-24 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
          {vehicleId?.images?.[0] ? (
            <img
              src={vehicleId.images[0]}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          )}
        </div>

        <div className="flex-1">
          <h2 className="font-semibold text-lg">
            {vehicleId?.make} {vehicleId?.model}
          </h2>
          <p className="text-sm text-gray-600">
            {vehicleId?.location} • {vehicleId?.category}
          </p>

          {vehicleId?._id && (
            <button
              onClick={() => navigate(`/vehicles/${vehicleId._id}`)}
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              View vehicle details →
            </button>
          )}
        </div>
      </div>

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
          onClick={() => onAskDelete(_id)}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
