const Inquiry = require("../models/Inquiry");
const User = require("../models/User");
const { sendInquiryReplyEmail } = require("../services/emailService");


//USER – Submit inquiry (RENTER / OWNER ONLY)

exports.createInquiry = async (req, res) => {
  try {
    if (!["RENTER", "OWNER"].includes(req.user.role)) {
      return res.status(403).json({
        message: "Only renters and owners can raise support inquiries",
      });
    }

    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        message: "Subject and message are required",
      });
    }

    const inquiry = await Inquiry.create({
      user: req.user.id,
      subject,
      message,
    });

    res.status(201).json({
      message: "Inquiry submitted successfully",
      inquiry,
    });
  } catch {
    res.status(500).json({ message: "Failed to submit inquiry" });
  }
};

 // USER – View own inquiries

exports.getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(inquiries);
  } catch {
    res.status(500).json({ message: "Failed to fetch inquiries" });
  }
};


// ADMIN – View all inquiries

exports.getAllInquiriesAdmin = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const inquiries = await Inquiry.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.json(inquiries);
  } catch {
    res.status(500).json({ message: "Failed to fetch inquiries" });
  }
};


// ADMIN – Reply to inquiry

exports.replyToInquiry = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: "Reply message is required" });
    }

    const inquiry = await Inquiry.findById(req.params.id).populate(
      "user",
      "email name"
    );

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    inquiry.reply = reply;
    inquiry.status = "REPLIED";
    await inquiry.save();

    sendInquiryReplyEmail({
      to: inquiry.user.email,
      subject: inquiry.subject,
      reply,
      userName: inquiry.user.name,
    }).catch(() => {});

    res.json({
      message: "Reply sent successfully",
      inquiry,
    });
  } catch {
    res.status(500).json({ message: "Failed to reply to inquiry" });
  }
};


 // ADMIN – Close inquiry

exports.closeInquiry = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    inquiry.status = "CLOSED";
    await inquiry.save();

    res.json({
      message: "Inquiry closed successfully",
      inquiry,
    });
  } catch {
    res.status(500).json({ message: "Failed to close inquiry" });
  }
};
