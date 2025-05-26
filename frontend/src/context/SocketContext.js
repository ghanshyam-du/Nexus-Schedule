"use client"

import { createContext, useContext, useEffect, useState } from "react"
import socketService from "../services/socketService"
import { useAuth } from "./AuthContext"

const SocketContext = createContext()

export function SocketProvider({ children }) {
  const { isAuthenticated, token } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [agentCommunications, setAgentCommunications] = useState([])
  const [notifications, setNotifications] = useState([])
  const [agentStatus, setAgentStatus] = useState({})

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to socket
      const socket = socketService.connect(token)

      // Set up event listeners
      socket.on("connect", () => {
        setIsConnected(true)
        socketService.subscribeToNotifications()
        socketService.getAgentStatus()
      })

      socket.on("disconnect", () => {
        setIsConnected(false)
      })

      // Agent communication listener
      socketService.onAgentCommunication((communication) => {
        setAgentCommunications((prev) => [...prev, communication])
      })

      // Notification listener
      socketService.onNewNotification((notification) => {
        setNotifications((prev) => [notification, ...prev])
      })

      // Agent status listener
      socketService.onAgentStatus((status) => {
        setAgentStatus(status)
      })

      return () => {
        socketService.removeAllListeners()
        socketService.disconnect()
        setIsConnected(false)
      }
    }
  }, [isAuthenticated, token])

  const sendVoiceInput = (text) => {
    socketService.sendVoiceInput(text)
  }

  const bookAppointment = (appointmentData) => {
    socketService.bookAppointment(appointmentData)
  }

  const updateAppointmentStatus = (appointmentId, status, clientId, providerId) => {
    socketService.updateAppointmentStatus(appointmentId, status, clientId, providerId)
  }

  const updateAvailability = (availability) => {
    socketService.updateAvailability(availability)
  }

  const clearAgentCommunications = () => {
    setAgentCommunications([])
  }

  const markNotificationAsRead = (notificationId) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
  }

  const value = {
    isConnected,
    agentCommunications,
    notifications,
    agentStatus,
    sendVoiceInput,
    bookAppointment,
    updateAppointmentStatus,
    updateAvailability,
    clearAgentCommunications,
    markNotificationAsRead,
    socketService,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

export default SocketContext
