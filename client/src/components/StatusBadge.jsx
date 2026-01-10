export default function StatusBadge({ status }) {
  const map = {
    ACTIVE: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
    COMPLETED: "bg-green-100 text-green-700",

    SUCCESS: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    CREATED: "bg-red-100 text-red-700",

    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        map[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
