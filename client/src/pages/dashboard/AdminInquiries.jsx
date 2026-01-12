import { useEffect, useState } from "react";
import api from "../../api/axios";
import BackButton from "../../components/BackButton";
import StatusBadge from "../../components/StatusBadge";

const ITEMS_PER_PAGE = 6;

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyText, setReplyText] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/inquiries/admin");
      setInquiries(res.data || []);
      setPage(1);
    } catch {
      setError("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (id) => {
    if (!replyText[id]) return;

    try {
      setSubmitting(true);
      await api.post(`/inquiries/${id}/reply`, {
        reply: replyText[id],
      });
      setReplyText((prev) => ({ ...prev, [id]: "" }));
      fetchInquiries();
    } catch {
      alert("Failed to send reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (id) => {
    try {
      setSubmitting(true);
      await api.patch(`/inquiries/${id}/close`);
      fetchInquiries();
    } catch {
      alert("Failed to close inquiry");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInquiries =
    statusFilter === "ALL"
      ? inquiries
      : inquiries.filter((i) => i.status === statusFilter);

  const totalPages = Math.ceil(filteredInquiries.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedInquiries = filteredInquiries.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 max-w-6xl mx-auto">
      <BackButton to="/dashboard/admin" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Support Inquiries</h1>
          <p className="text-sm text-gray-500">
            Respond to user questions and manage support requests
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="ALL">All</option>
          <option value="OPEN">Open</option>
          <option value="REPLIED">Replied</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {filteredInquiries.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No inquiries found.
        </div>
      )}

      <div className="space-y-6">
        {paginatedInquiries.map((inq) => (
          <div
            key={inq._id}
            className="bg-white rounded-xl shadow-sm border p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <div>
                <h3 className="font-semibold text-lg">{inq.subject}</h3>
                <p className="text-sm text-gray-500">
                  {inq.user?.name} • {inq.user?.email}
                </p>
              </div>

              <StatusBadge status={inq.status} />
            </div>

            <p className="text-gray-700 mb-4">{inq.message}</p>

            {inq.reply && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm font-semibold mb-1">Admin Reply</p>
                <p className="text-sm text-gray-700">{inq.reply}</p>
              </div>
            )}

            {inq.status !== "CLOSED" && (
              <div className="space-y-3">
                {inq.status === "OPEN" && (
                  <>
                    <textarea
                      rows="3"
                      placeholder="Write a friendly reply..."
                      value={replyText[inq._id] || ""}
                      onChange={(e) =>
                        setReplyText((prev) => ({
                          ...prev,
                          [inq._id]: e.target.value,
                        }))
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReply(inq._id)}
                        disabled={submitting}
                        className="px-4 py-2 bg-black text-white rounded-lg"
                      >
                        Send Reply
                      </button>

                      <button
                        onClick={() => handleClose(inq._id)}
                        disabled={submitting}
                        className="px-4 py-2 border rounded-lg"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}

                {inq.status === "REPLIED" && (
                  <button
                    onClick={() => handleClose(inq._id)}
                    disabled={submitting}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Close Inquiry
                  </button>
                )}
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
    </div>
  );
}
