import React from "react";

export default function InvoiceModal({
  open,
  onClose,
  payment,
  role,
}) {
  if (!open || !payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-8 relative print:shadow-none print:rounded-none">

        {/* CLOSE (hidden in print) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black print:hidden"
        >
          ✕
        </button>

        {/* HEADER */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">
            Payment Invoice
          </h1>
          <p className="text-sm text-gray-500">
            Online Vehicle Rental System
          </p>
        </div>

        {/* STATUS */}
        <div className="mb-6 text-center">
          <span
            className={`px-4 py-1 rounded-full text-sm font-semibold ${
              payment.status === "SUCCESS"
                ? "bg-green-100 text-green-700"
                : payment.status === "FAILED"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {payment.status}
          </span>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

          <div>
            <p className="font-semibold mb-1">Vehicle</p>
            <p>
              {payment.vehicle?.make}{" "}
              {payment.vehicle?.model}
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Amount Paid</p>
            <p className="text-lg font-bold">
              ₹{payment.amount}
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Order ID</p>
            <p className="break-all">
              {payment.razorpayOrderId}
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Payment ID</p>
            <p className="break-all">
              {payment.razorpayPaymentId || "-"}
            </p>
          </div>

          <div>
            <p className="font-semibold mb-1">Payment Date</p>
            <p>
              {new Date(payment.createdAt).toLocaleString()}
            </p>
          </div>

          {role === "ADMIN" && (
            <div>
              <p className="font-semibold mb-1">Renter</p>
              <p>{payment.renter?.name}</p>
              <p className="text-gray-500">
                {payment.renter?.email}
              </p>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex justify-end gap-4 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Print / Download
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
