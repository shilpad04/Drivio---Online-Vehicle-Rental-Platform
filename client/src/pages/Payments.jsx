import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllPaymentsAdmin, getMyPayments } from "../api/payment";
import InvoiceModal from "../components/InvoiceModal";
import { paginate } from "../utils/pagination";
import { exportCSV } from "../utils/exportCSV";
import StatusBadge from "../components/StatusBadge";

const ITEMS_PER_PAGE = 10;

export default function Payments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    if (role) fetchPayments();
  }, [role]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const res =
        role === "ADMIN" ? await getAllPaymentsAdmin() : await getMyPayments();

      setPayments(res || []);
      setPage(1);
    } catch {
      setError("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const { totalPages, paginatedItems: paginatedPayments } = paginate(
    payments,
    page,
    ITEMS_PER_PAGE
  );

  // CSV EXPORT (SAFE UTILITY)
  const exportToCSV = () => {
    const headers =
      role === "ADMIN"
        ? [
            "Date",
            "Vehicle",
            "Renter Name",
            "Renter Email",
            "Amount",
            "Status",
            "Order ID",
            "Payment ID",
          ]
        : ["Date", "Vehicle", "Amount", "Status", "Order ID", "Payment ID"];

    const rows = payments.map((p) => {
      const row = [
        new Date(p.createdAt).toLocaleDateString(),
        `${p.vehicle?.make || ""} ${p.vehicle?.model || ""}`,
      ];

      if (role === "ADMIN") {
        row.push(p.renter?.name || "", p.renter?.email || "");
      }

      row.push(
        p.amount,
        p.status === "CREATED" ? "FAILED" : p.status,
        p.razorpayOrderId || "",
        p.razorpayPaymentId || ""
      );

      return row;
    });

    exportCSV({
      headers,
      rows,
      fileName: role === "ADMIN" ? "payments-admin.csv" : "payments-renter.csv",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 text-center">Loading payments...</div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate(`/dashboard/${role?.toLowerCase()}`)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6"
      >
        <i className="fa-solid fa-arrow-left"></i>
        Back
      </button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Payments</h1>

        {payments.length > 0 && (
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Export CSV
          </button>
        )}
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {payments.length === 0 ? (
        <p className="text-gray-600">No payments found.</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Vehicle</th>
                  {role === "ADMIN" && (
                    <th className="px-4 py-3 text-left">Renter</th>
                  )}
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Payment ID</th>
                  <th className="px-4 py-3 text-left">Invoice</th>
                </tr>
              </thead>

              <tbody>
                {paginatedPayments.map((p) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {p.vehicle?.make} {p.vehicle?.model}
                    </td>

                    {role === "ADMIN" && (
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.renter?.name}</div>
                        <div className="text-xs text-gray-500">
                          {p.renter?.email}
                        </div>
                      </td>
                    )}

                    <td className="px-4 py-3 font-semibold">₹{p.amount}</td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        status={p.status === "CREATED" ? "FAILED" : p.status}
                      />
                    </td>

                    <td className="px-4 py-3 text-xs">{p.razorpayOrderId}</td>

                    <td className="px-4 py-3 text-xs">
                      {p.razorpayPaymentId || "-"}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {p.status === "SUCCESS" ? (
                        <button
                          onClick={() => {
                            setSelectedPayment(p);
                            setShowInvoice(true);
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          View Invoice
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    page === i + 1
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <InvoiceModal
        open={showInvoice}
        onClose={() => {
          setShowInvoice(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
        role={role}
      />
    </div>
  );
}
