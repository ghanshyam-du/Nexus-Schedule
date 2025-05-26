const jwt = require("jsonwebtoken")
const User = require("../models/User")

function socketHandler(io) {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error("Authentication error"))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret")
      const user = await User.findById(decoded.userId).select("-password")

      if (!user) {
        return next(new Error("User not found"))
      }

      socket.userId = decoded.userId
      socket.userRole = decoded.role
      socket.user = user
      next()
    } catch (error) {
      next(new Error("Authentication error"))
    }
  })

  io.on("connection", (socket) => {
    console.log(`User ${socket.userId} connected`)

    // Join user to their personal room
    socket.join(`user_${socket.userId}`)

    // Join providers to provider room
    if (socket.userRole === "provider") {
      socket.join("providers")
    }

    // Handle voice input events
    socket.on("voice_input", async (data) => {
      try {
        console.log(`Voice input from user ${socket.userId}:`, data.text)

        // Emit processing status
        socket.emit("voice_processing", { status: "processing" })

        // Simulate AI processing delay
        setTimeout(() => {
          const response = {
            originalText: data.text,
            aiResponse:
              "I found Dr. Sarah Johnson available for a dental checkup next Tuesday at 10:30 AM. Would you like me to book this appointment?",
            suggestions: ["Yes, book it", "Find other times", "Show more providers"],
            timestamp: new Date(),
          }

          socket.emit("voice_response", response)
        }, 2000)
      } catch (error) {
        socket.emit("voice_error", { message: "Error processing voice input" })
      }
    })

    // Handle appointment booking events
    socket.on("book_appointment", async (data) => {
      try {
        console.log(`Booking request from user ${socket.userId}:`, data)

        // Simulate AI agent communication
        const agentCommunication = [
          {
            agent: "UserAgent",
            action: "booking_request",
            message: "User wants to book appointment",
            timestamp: new Date(),
          },
          {
            agent: "SchedulerAgent",
            action: "availability_check",
            message: "Checking provider availability",
            timestamp: new Date(),
          },
          {
            agent: "ProviderAgent",
            action: "slot_confirmation",
            message: "Slot available and confirmed",
            timestamp: new Date(),
          },
        ]

        // Emit each step of agent communication
        for (let i = 0; i < agentCommunication.length; i++) {
          setTimeout(() => {
            socket.emit("agent_communication", agentCommunication[i])

            // If this is the last step, emit booking confirmation
            if (i === agentCommunication.length - 1) {
              setTimeout(() => {
                socket.emit("booking_confirmed", {
                  appointmentId: "apt_" + Date.now(),
                  message: "Appointment successfully booked!",
                  details: data,
                })
              }, 1000)
            }
          }, i * 1500)
        }
      } catch (error) {
        socket.emit("booking_error", { message: "Error booking appointment" })
      }
    })

    // Handle real-time notifications
    socket.on("subscribe_notifications", () => {
      socket.join(`notifications_${socket.userId}`)
      console.log(`User ${socket.userId} subscribed to notifications`)
    })

    // Handle provider availability updates
    socket.on("update_availability", async (data) => {
      if (socket.userRole !== "provider") {
        return socket.emit("error", { message: "Unauthorized" })
      }

      try {
        console.log(`Provider ${socket.userId} updated availability:`, data)

        // Broadcast to all users that this provider's availability changed
        socket.broadcast.emit("provider_availability_updated", {
          providerId: socket.userId,
          availability: data,
        })

        socket.emit("availability_updated", { success: true })
      } catch (error) {
        socket.emit("error", { message: "Error updating availability" })
      }
    })

    // Handle appointment status updates
    socket.on("update_appointment_status", async (data) => {
      try {
        const { appointmentId, status } = data
        console.log(`Appointment ${appointmentId} status updated to ${status}`)

        // Emit to both client and provider
        io.to(`user_${data.clientId}`).emit("appointment_status_updated", {
          appointmentId,
          status,
          timestamp: new Date(),
        })

        io.to(`user_${data.providerId}`).emit("appointment_status_updated", {
          appointmentId,
          status,
          timestamp: new Date(),
        })
      } catch (error) {
        socket.emit("error", { message: "Error updating appointment status" })
      }
    })

    // Handle AI agent status requests
    socket.on("get_agent_status", () => {
      const agentStatus = {
        schedulerAgent: { status: "active", load: 0.3 },
        userAgent: { status: "active", load: 0.2 },
        providerAgent: { status: "active", load: 0.4 },
        priorityAgent: { status: "active", load: 0.1 },
      }

      socket.emit("agent_status", agentStatus)
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`)
    })

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error)
    })
  })

  // Utility function to send notification to specific user
  function sendNotificationToUser(userId, notification) {
    io.to(`notifications_${userId}`).emit("new_notification", notification)
  }

  // Utility function to broadcast to all providers
  function broadcastToProviders(event, data) {
    io.to("providers").emit(event, data)
  }

  // Export utility functions
  io.sendNotificationToUser = sendNotificationToUser
  io.broadcastToProviders = broadcastToProviders

  return io
}

module.exports = socketHandler
