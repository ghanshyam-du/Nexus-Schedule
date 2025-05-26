const express = require("express")
const { body, validationResult } = require("express-validator")
const Appointment = require("../models/Appointment")
const authMiddleware = require("../middleware/auth")
const aiAgentService = require("../services/aiAgentService")
const notificationService = require("../services/notificationService")

const router = express.Router()

// Get user appointments
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { status, date } = req.query
    const query = {}

    if (req.user.role === "client") {
      query.clientId = req.user.userId
    } else if (req.user.role === "provider") {
      query.providerId = req.user.userId
    }

    if (status) {
      query.status = status
    }

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      query.date = { $gte: startDate, $lt: endDate }
    }

    const appointments = await Appointment.find(query)
      .populate("clientId", "name email phone")
      .populate("providerId", "businessName")
      .sort({ date: 1, time: 1 })

    res.json({
      success: true,
      appointments,
    })
  } catch (error) {
    console.error("Get appointments error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create appointment
router.post(
  "/",
  [
    authMiddleware,
    body("service").notEmpty().withMessage("Service is required"),
    body("providerId").notEmpty().withMessage("Provider is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("time").notEmpty().withMessage("Time is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { service, providerId, date, time, notes, urgency = "medium" } = req.body

      // Check for conflicts
      const existingAppointment = await Appointment.findOne({
        providerId,
        date: new Date(date),
        time,
        status: { $in: ["pending", "confirmed"] },
      })

      if (existingAppointment) {
        // Use AI agent to find alternatives
        const alternatives = await aiAgentService.findAlternativeSlots({
          service,
          providerId,
          date,
          time,
          urgency,
        })

        return res.status(409).json({
          success: false,
          message: "Time slot not available",
          alternatives,
        })
      }

      // Create appointment
      const appointment = new Appointment({
        clientId: req.user.userId,
        providerId,
        service,
        date: new Date(date),
        time,
        notes,
        priority: urgency === "high" ? "high" : urgency === "low" ? "low" : "medium",
        aiNegotiated: false,
      })

      await appointment.save()

      // Populate appointment data
      await appointment.populate("clientId", "name email phone")
      await appointment.populate("providerId", "businessName")

      // Send notifications
      await notificationService.sendAppointmentNotification(appointment, "created")

      res.status(201).json({
        success: true,
        appointment,
      })
    } catch (error) {
      console.error("Create appointment error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update appointment status
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body
    const appointmentId = req.params.id

    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    // Check authorization
    if (req.user.role === "client" && appointment.clientId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" })
    }
    if (req.user.role === "provider" && appointment.providerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" })
    }

    appointment.status = status
    await appointment.save()

    // Send notifications
    await notificationService.sendAppointmentNotification(appointment, "updated")

    res.json({
      success: true,
      appointment,
    })
  } catch (error) {
    console.error("Update appointment error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Reschedule appointment
router.put(
  "/:id/reschedule",
  [
    authMiddleware,
    body("date").isISO8601().withMessage("Valid date is required"),
    body("time").notEmpty().withMessage("Time is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { date, time } = req.body
      const appointmentId = req.params.id

      const appointment = await Appointment.findById(appointmentId)
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" })
      }

      // Check authorization
      if (appointment.clientId.toString() !== req.user.userId) {
        return res.status(403).json({ message: "Not authorized" })
      }

      // Check for conflicts
      const conflict = await Appointment.findOne({
        providerId: appointment.providerId,
        date: new Date(date),
        time,
        status: { $in: ["pending", "confirmed"] },
        _id: { $ne: appointmentId },
      })

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: "Time slot not available",
        })
      }

      // Update appointment
      appointment.date = new Date(date)
      appointment.time = time
      appointment.status = "pending" // Require provider confirmation
      appointment.aiNegotiated = true

      appointment.negotiationLog.push({
        agent: "UserAgent",
        action: "reschedule_request",
        timestamp: new Date(),
        details: { oldDate: appointment.date, oldTime: appointment.time, newDate: date, newTime: time },
      })

      await appointment.save()

      // Send notifications
      await notificationService.sendAppointmentNotification(appointment, "rescheduled")

      res.json({
        success: true,
        appointment,
      })
    } catch (error) {
      console.error("Reschedule appointment error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Cancel appointment
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { reason } = req.body
    const appointmentId = req.params.id

    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    // Check authorization
    if (appointment.clientId.toString() !== req.user.userId && appointment.providerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" })
    }

    appointment.status = "cancelled"
    appointment.cancellationReason = reason
    await appointment.save()

    // Send notifications
    await notificationService.sendAppointmentNotification(appointment, "cancelled")

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
    })
  } catch (error) {
    console.error("Cancel appointment error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
