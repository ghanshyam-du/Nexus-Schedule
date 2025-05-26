import { io } from "socket.io-client"

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  connect(token) {
    if (this.socket) {
      this.disconnect()
    }

    const serverUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000"

    this.socket = io(serverUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    })

    this.socket.on("connect", () => {
      console.log("Connected to server")
      this.isConnected = true
    })

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server")
      this.isConnected = false
    })

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error)
      this.isConnected = false
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Voice communication
  sendVoiceInput(text) {
    if (this.socket) {
      this.socket.emit("voice_input", { text, timestamp: new Date() })
    }
  }

  onVoiceResponse(callback) {
    if (this.socket) {
      this.socket.on("voice_response", callback)
    }
  }

  onVoiceProcessing(callback) {
    if (this.socket) {
      this.socket.on("voice_processing", callback)
    }
  }

  onVoiceError(callback) {
    if (this.socket) {
      this.socket.on("voice_error", callback)
    }
  }

  // Appointment booking
  bookAppointment(appointmentData) {
    if (this.socket) {
      this.socket.emit("book_appointment", appointmentData)
    }
  }

  onBookingConfirmed(callback) {
    if (this.socket) {
      this.socket.on("booking_confirmed", callback)
    }
  }

  onBookingError(callback) {
    if (this.socket) {
      this.socket.on("booking_error", callback)
    }
  }

  // Agent communication
  onAgentCommunication(callback) {
    if (this.socket) {
      this.socket.on("agent_communication", callback)
    }
  }

  getAgentStatus() {
    if (this.socket) {
      this.socket.emit("get_agent_status")
    }
  }

  onAgentStatus(callback) {
    if (this.socket) {
      this.socket.on("agent_status", callback)
    }
  }

  // Notifications
  subscribeToNotifications() {
    if (this.socket) {
      this.socket.emit("subscribe_notifications")
    }
  }

  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on("new_notification", callback)
    }
  }

  // Appointment updates
  updateAppointmentStatus(appointmentId, status, clientId, providerId) {
    if (this.socket) {
      this.socket.emit("update_appointment_status", {
        appointmentId,
        status,
        clientId,
        providerId,
      })
    }
  }

  onAppointmentStatusUpdated(callback) {
    if (this.socket) {
      this.socket.on("appointment_status_updated", callback)
    }
  }

  // Provider availability
  updateAvailability(availability) {
    if (this.socket) {
      this.socket.emit("update_availability", availability)
    }
  }

  onProviderAvailabilityUpdated(callback) {
    if (this.socket) {
      this.socket.on("provider_availability_updated", callback)
    }
  }

  onAvailabilityUpdated(callback) {
    if (this.socket) {
      this.socket.on("availability_updated", callback)
    }
  }

  // Error handling
  onError(callback) {
    if (this.socket) {
      this.socket.on("error", callback)
    }
  }

  // Utility methods
  isSocketConnected() {
    return this.isConnected && this.socket?.connected
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners()
    }
  }
}

export default new SocketService()
