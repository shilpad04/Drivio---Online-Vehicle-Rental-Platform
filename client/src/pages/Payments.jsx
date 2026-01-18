import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllPaymentsAdmin, getMyPayments } from "../api/payment";
import api from "../api/axios"; 
import InvoiceModal from "../components/InvoiceModal";
import ConfirmModal from "../components/ConfirmModal";
import { paginate } from "../utils/pagination";
import StatusBadge from "../components/StatusBadge";
import BackButton from "../components/BackButton";
import { formatDate } from "../utils/formatDate";

const ITEMS_PER_PAGE = 10;

export default function Payments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundTarget, setRefundTarget] = useState(null);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    if (role) fetchPayments();
  }, [role]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res =
        role === "ADMIN"
          ? await getAllPaymentsAdmin()
          : await getMyPayments();
      setPayments(res || []);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  const confirmRefund = async () => {
    if (!refundTarget) return;

    try {
      setRefunding(true);

      console.log("➡️ Calling refund API for:", refundTarget._id);

      const res = await api.post(
        `/admin/payments/${refundTarget._id}/refund`
      );

      console.log("✅ Refund API success:", res.data);

      setShowRefundModal(false);
      setRefundTarget(null);
      fetchPayments();
    } catch (error) {
      console.error(
        "❌ Refund API failed:",
        error.response?.data || error
      );
    } finally {
      setRefunding(false);
    }
  };

  const { totalPages, paginatedItems } = paginate(
    payments,
    page,
    ITEMS_PER_PAGE
  );

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-6 max-w-7xl mx-auto">
      <BackButton to={`/dashboard/${role?.toLowerCase()}`} />

      <h1 className="text-2xl font-bold mb-6">Payments</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <p className="text-xs text-gray-500 mb-2 md:hidden px-4 pt-3">
          Swipe horizontally to view all details →
        </p>

        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Vehicle</th>

              {role === "ADMIN" && (
                <th className="px-4 py-3 hidden md:table-cell">
                  Renter
                </th>
              )}

              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 hidden md:table-cell">
                Order ID
              </th>
              <th className="px-4 py-3 hidden lg:table-cell">
                Payment ID
              </th>
              <th className="px-4 py-3">Invoice</th>
            </tr>
          </thead>

          <tbody>
            {paginatedItems.map((p) => (
              <tr key={p._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  {formatDate(p.createdAt)}
                </td>

                <td className="px-4 py-3">
                  {p.vehicle?.make} {p.vehicle?.model}
                </td>

                {role === "ADMIN" && (
                  <td className="px-4 py-3 hidden md:table-cell">
                    {p.renter?.email}
                  </td>
                )}

                <td className="px-4 py-3 font-semibold">
                  ₹{p.amount}
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>

                <td className="px-4 py-3 text-xs hidden md:table-cell">
                  {p.razorpayOrderId}
                </td>

                <td className="px-4 py-3 text-xs hidden lg:table-cell">
                  {p.razorpayPaymentId || "-"}
                </td>

                <td className="px-4 py-3">
                  {p.status === "SUCCESS" && (
                    <button
                      onClick={() => {
                        setSelectedPayment(p);
                        setShowInvoice(true);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  )}

                  {role === "ADMIN" && p.status === "REFUND_PENDING" && (
                    <button
                      onClick={() => {
                        setRefundTarget(p);
                        setShowRefundModal(true);
                      }}
                      className="ml-3 text-red-600 hover:underline"
                    >
                      Refund
                    </button>
                  )}

                  {p.status !== "SUCCESS" &&
                    p.status !== "REFUND_PENDING" &&
                    "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InvoiceModal
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
        payment={selectedPayment}
        role={role}
      />

      <ConfirmModal
        open={showRefundModal}
        title="Process refund?"
        description="This will trigger a Razorpay refund. This action cannot be undone."
        confirmText="Yes, Refund"
        danger
        loading={refunding}
        onCancel={() => {
          if (refunding) return;
          setShowRefundModal(false);
          setRefundTarget(null);
        }}
        onConfirm={confirmRefund}
      />
    </div>
  );
}
