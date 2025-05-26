const mongoose = require("mongoose")

const providerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    services: [
      {
        name: String,
        duration: Number, // in minutes
        price: Number,
        description: String,
      },
    ],
    availability: [
      {
        day: {
          type: String,
          enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        },
        startTime: String,
        endTime: String,
        enabled: Boolean,
      },
    ],
    aiSettings: {
      autoAcceptBookings: { type: Boolean, default: true },
      allowRescheduling: { type: Boolean, default: true },
      priorityThreshold: { type: String, default: "medium" },
      maxDailyBookings: { type: Number, default: 10 },
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Provider", providerSchema)
