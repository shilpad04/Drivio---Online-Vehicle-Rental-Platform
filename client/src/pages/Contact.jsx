import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";
import StatusBadge from "../components/StatusBadge";
import { paginate } from "../utils/pagination";

const ITEMS_PER_PAGE = 5;

export default function Contact() {
  const { user } = useAuth();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [inquiries, setInquiries] = useState([]);
  const [fetching, setFetching] = useState(false);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (user) fetchMyInquiries();
  }, [user]);

  const fetchMyInquiries = async () => {
    try {
      setFetching(true);
      const res = await api.get("/inquiries/my");
      setInquiries(res.data || []);
      setPage(1);
    } catch {
      setError("Failed to load inquiries");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!subject || !message) {
      setError("Subject and message are required");
      return;
    }

    try {
      setLoading(true);
      await api.post("/inquiries", { subject, message });
      setSuccess(
        "Your message has been sent. Our support team will respond shortly."
      );
      setSubject("");
      setMessage("");
      fetchMyInquiries();
    } catch {
      setError("Failed to submit inquiry");
    } finally {
      setLoading(false);
    }
  };

  const filteredInquiries =
    statusFilter === "ALL"
      ? inquiries
      : inquiries.filter((i) => i.status === statusFilter);

  const {
    totalPages,
    paginatedItems: paginatedInquiries,
  } = paginate(filteredInquiries, page, ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-32 pb-12">
      <BackButton className="mt-2" />

      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Contact Support</h1>
        <p className="text-gray-600">
          We’re here to help — tell us what’s going on.
        </p>
      </div>

      {/* GUEST VIEW  */}
      {!user && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">For Renters</h2>
            <p className="text-gray-700 text-sm">
              You can browse vehicles freely. To check availability,
              book vehicles, or contact support directly, please
              create an account or log in.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              For Vehicle Owners
            </h2>
            <p className="text-gray-700 text-sm">
              Register as a vehicle owner to list vehicles, manage
              bookings, and communicate with renters.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">
              General Support
            </h2>
            <p className="text-sm text-gray-700">
              Email: support@drivio.com
            </p>
            <p className="text-sm text-gray-700">
              Phone: +91 90000 00000
            </p>
          </div>

          <p className="text-sm text-gray-500 pt-4">
            Login or register to raise a support request and track
            responses.
          </p>
        </div>
      )}

      {/* USER VIEW */}
      {user && (
        <>
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-md p-8 mb-16"
          >
            <h2 className="text-xl font-semibold mb-1">
              Send us a message
            </h2>

            {error && <p className="text-red-600 mb-3">{error}</p>}
            {success && (
              <p className="text-green-600 mb-3">{success}</p>
            )}

            <input
              type="text"
              placeholder="Eg: Issue with booking"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 mb-4"
            />

            <textarea
              rows="4"
              placeholder="Describe your issue..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 mb-4"
            />

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white rounded-lg"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>

          <div className="space-y-5">
            {paginatedInquiries.map((inq) => (
              <div
                key={inq._id}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm p-6"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">
                    {inq.subject}
                  </h3>
                  <StatusBadge status={inq.status} />
                </div>

                <p className="text-gray-700 mb-4">
                  {inq.message}
                </p>

                {inq.reply && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-sm font-semibold mb-1 text-blue-700">
                      Support Reply
                    </p>
                    <p className="text-sm text-gray-700">
                      {inq.reply}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
