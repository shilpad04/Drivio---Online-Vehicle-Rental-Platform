const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// BOOKING CONFIRMATION EMAIL
exports.sendBookingConfirmationEmail = async ({
  to,
  booking,
  vehicle,
}) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "✅ Booking Confirmed – Your Vehicle is Reserved",
    html: `
      <h2>Booking Confirmed</h2>
      <p>Your booking has been successfully confirmed.</p>

      <h3>Vehicle Details</h3>
      <p><strong>${vehicle.make} ${vehicle.model}</strong></p>

      <h3>Booking Dates</h3>
      <p>${booking.startDate.toDateString()} → ${booking.endDate.toDateString()}</p>

      <p><strong>Status:</strong> ACTIVE</p>
      <p><strong>Booking ID:</strong> ${booking._id}</p>

      <br/>
      <p>Thank you for choosing our service.</p>
    `,
  };

  await sgMail.send(msg);
};

// BOOKING CANCELLATION EMAIL
exports.sendBookingCancellationEmail = async ({
  to,
  booking,
  vehicle,
}) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "❌ Booking Cancelled",
    html: `
      <h2>Booking Cancelled</h2>
      <p>Your booking has been cancelled successfully.</p>

      <p><strong>Vehicle:</strong> ${vehicle.make} ${vehicle.model}</p>
      <p><strong>Booking ID:</strong> ${booking._id}</p>

      <br/>
      <p>If this was a mistake, you can book again anytime.</p>
    `,
  };

  await sgMail.send(msg);
};

// BOOKING COMPLETION EMAIL
exports.sendBookingCompletionEmail = async ({
  to,
  booking,
  vehicle,
}) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "🎉 Trip Completed – Thank You!",
    html: `
      <h2>Trip Completed</h2>
      <p>Your rental period has been completed.</p>

      <p><strong>Vehicle:</strong> ${vehicle.make} ${vehicle.model}</p>
      <p><strong>Booking ID:</strong> ${booking._id}</p>

      <br/>
      <p>We hope you had a great experience.</p>
      <p>Please consider leaving a review.</p>
    `,
  };

  await sgMail.send(msg);
};

// REVIEW REMINDER EMAIL
exports.sendReviewReminderEmail = async ({
  to,
  booking,
  vehicle,
}) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: "⭐ How was your ride? Leave a review",
    html: `
      <h2>Your Trip Is Complete!</h2>

      <p>We hope you enjoyed your ride.</p>

      <p><strong>Vehicle:</strong> ${vehicle.make} ${vehicle.model}</p>
      <p><strong>Booking ID:</strong> ${booking._id}</p>

      <br/>

      <p>Your feedback helps other users make better decisions.</p>
      <p>Please take a moment to leave a review.</p>

      <br/>
      <p>Thank you for choosing our service.</p>
    `,
  };

  await sgMail.send(msg);
};

// INQUIRY REPLAY EMAIL
exports.sendInquiryReplyEmail = async ({
  to,
  subject,
  reply,
  userName,
}) => {
  await transporter.sendMail({
    to,
    subject: `Support Reply: ${subject}`,
    html: `
      <p>Hi ${userName},</p>
      <p>Thanks for contacting support. Here is our reply:</p>
      <blockquote>${reply}</blockquote>
      <p>If you have further questions, feel free to reply.</p>
      <p>— Support Team</p>
    `,
  });
};
