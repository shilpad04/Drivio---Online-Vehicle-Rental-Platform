const Booking = require("../models/Booking");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");

const {
  sendBookingCompletionEmail,
  sendReviewReminderEmail,
} = require("../services/emailService");

async function autoCompleteExpiredBookings() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiredBookings = await Booking.find({
    status: "ACTIVE",
    endDate: { $lt: today },
  });

  for (const booking of expiredBookings) {
    booking.status = "COMPLETED";
    await booking.save();

    const renter = await User.findById(booking.renter);
    const vehicle = await Vehicle.findById(booking.vehicle);

    if (renter && vehicle) {
      sendBookingCompletionEmail({
        to: renter.email,
        booking,
        vehicle,
      }).catch(() => {});

      sendReviewReminderEmail({
        to: renter.email,
        booking,
        vehicle,
      }).catch(() => {});
    }
  }
}

module.exports = autoCompleteExpiredBookings;
