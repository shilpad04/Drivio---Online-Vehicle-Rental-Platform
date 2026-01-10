const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    make: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
    },

    vehicleType: {
      type: String,
      enum: ["car", "bike", "suv"],
      required: true,
    },

    category: {
      type: String,
      enum: ["economy", "premium", "luxury"],
      required: true,
    },

    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "cng", "hybrid"], 
      required: true,
    },

    kilometersDriven: {
      type: Number,
      required: true,
      min: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    pricePerDay: {
      type: Number,
      required: true,
    },

    availability: {
      type: Boolean,
      default: true,
    },

    images: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
