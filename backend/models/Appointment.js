const mongoose = require("mongoose")

const appointmentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 60, // minutes
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    aiNegotiated: {
      type: Boolean,
      default: false,
    },
    negotiationLog: [
      {
        agent: String,
        action: String,
        timestamp: Date,
        details: Object,
      },
    ],
    notes: String,
    cancellationReason: String,
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Appointment", appointmentSchema)
