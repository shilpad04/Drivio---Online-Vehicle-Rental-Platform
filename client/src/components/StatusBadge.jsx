export default function StatusBadge({ status }) {
  const map = {
    // BOOKINGS
    ACTIVE: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
    COMPLETED: "bg-green-100 text-green-700",

    // PAYMENTS
    SUCCESS: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    CREATED: "bg-red-100 text-red-700",

    // VEHICLES
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",

    // CONTACT / INQUIRIES
    OPEN: "bg-yellow-100 text-yellow-700",
    REPLIED: "bg-blue-100 text-blue-700",
    CLOSED: "bg-green-100 text-green-700",
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
