const Payment = require("../models/Payment");

async function expirePendingPayments() {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  await Payment.updateMany(
    {
      status: "CREATED",
      createdAt: { $lt: tenMinutesAgo },
    },
    {
      $set: { status: "FAILED" },
    }
  );
}

module.exports = expirePendingPayments;
