// Utility functions

import { APPOINTMENT_STATUS, APPOINTMENT_PRIORITY, TIME_PREFERENCES, DAYS_OF_WEEK } from "./constants"

// Date and Time Utilities
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }
  return new Date(date).toLocaleDateString("en-US", defaultOptions)
}

export const formatTime = (time) => {
  // Convert 24-hour format to 12-hour format
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export const formatDateTime = (date, time) => {
  return `${formatDate(date)} at ${formatTime(time)}`
}

export const getRelativeTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? "s" : ""} ago`
  }
}

export const isToday = (date) => {
  const today = new Date()
  const checkDate = new Date(date)
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  )
}

export const isTomorrow = (date) => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const checkDate = new Date(date)
  return (
    checkDate.getDate() === tomorrow.getDate() &&
    checkDate.getMonth() === tomorrow.getMonth() &&
    checkDate.getFullYear() === tomorrow.getFullYear()
  )
}

// Appointment Utilities
export const getAppointmentStatusColor = (status) => {
  switch (status) {
    case APPOINTMENT_STATUS.CONFIRMED:
      return "text-green-600 bg-green-100"
    case APPOINTMENT_STATUS.PENDING:
      return "text-yellow-600 bg-yellow-100"
    case APPOINTMENT_STATUS.CANCELLED:
      return "text-red-600 bg-red-100"
    case APPOINTMENT_STATUS.COMPLETED:
      return "text-blue-600 bg-blue-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

export const getPriorityColor = (priority) => {
  switch (priority) {
    case APPOINTMENT_PRIORITY.HIGH:
      return "text-red-600 bg-red-100"
    case APPOINTMENT_PRIORITY.MEDIUM:
      return "text-yellow-600 bg-yellow-100"
    case APPOINTMENT_PRIORITY.LOW:
      return "text-green-600 bg-green-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

export const sortAppointmentsByDate = (appointments) => {
  return appointments.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`)
    const dateB = new Date(`${b.date} ${b.time}`)
    return dateA - dateB
  })
}

export const filterAppointmentsByStatus = (appointments, status) => {
  return appointments.filter((appointment) => appointment.status === status)
}

export const getUpcomingAppointments = (appointments) => {
  const now = new Date()
  return appointments.filter((appointment) => {
    const appointmentDate = new Date(`${appointment.date} ${appointment.time}`)
    return appointmentDate > now
  })
}

// Voice Processing Utilities
export const extractEntitiesFromText = (text) => {
  const lowerText = text.toLowerCase()
  const entities = {}

  // Extract service type
  if (lowerText.includes("dental") || lowerText.includes("dentist")) {
    entities.service = "dental_checkup"
  } else if (lowerText.includes("massage")) {
    entities.service = "massage_therapy"
  } else if (lowerText.includes("consultation")) {
    entities.service = "consultation"
  }

  // Extract time preference
  if (lowerText.includes("morning")) {
    entities.timePreference = TIME_PREFERENCES.MORNING
  } else if (lowerText.includes("afternoon")) {
    entities.timePreference = TIME_PREFERENCES.AFTERNOON
  } else if (lowerText.includes("evening")) {
    entities.timePreference = TIME_PREFERENCES.EVENING
  }

  // Extract day of week
  DAYS_OF_WEEK.forEach((day) => {
    if (lowerText.includes(day)) {
      entities.dayOfWeek = day
    }
  })

  // Extract urgency
  if (lowerText.includes("urgent") || lowerText.includes("emergency")) {
    entities.urgency = "high"
  } else if (lowerText.includes("soon") || lowerText.includes("asap")) {
    entities.urgency = "medium"
  }

  return entities
}

export const generateVoiceResponse = (intent, entities) => {
  switch (intent) {
    case "book_appointment":
      return generateBookingResponse(entities)
    case "reschedule_appointment":
      return "I can help you reschedule your appointment. Let me check your upcoming bookings."
    case "cancel_appointment":
      return "I can help you cancel your appointment. Which appointment would you like to cancel?"
    default:
      return "I'm sorry, I didn't understand that. Could you please try again?"
  }
}

const generateBookingResponse = (entities) => {
  const service = entities.service || "appointment"
  const timePreference = entities.timePreference || "your preferred time"

  if (entities.urgency === "high") {
    return `I understand this is urgent. Let me find the earliest available slot for ${service}.`
  }

  return `I can help you book ${service} for ${timePreference}. Let me check available slots.`
}

// Validation Utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

export const validateAppointmentData = (data) => {
  const errors = {}

  if (!data.service) {
    errors.service = "Service is required"
  }

  if (!data.date) {
    errors.date = "Date is required"
  } else {
    const appointmentDate = new Date(data.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (appointmentDate < today) {
      errors.date = "Date cannot be in the past"
    }
  }

  if (!data.time) {
    errors.time = "Time is required"
  }

  if (!data.providerId) {
    errors.providerId = "Provider is required"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// String Utilities
export const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const formatName = (firstName, lastName) => {
  return `${firstName} ${lastName}`.trim()
}

export const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

// Array Utilities
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

export const sortBy = (array, key, direction = "asc") => {
  return array.sort((a, b) => {
    if (direction === "asc") {
      return a[key] > b[key] ? 1 : -1
    } else {
      return a[key] < b[key] ? 1 : -1
    }
  })
}

export const filterBy = (array, filters) => {
  return array.filter((item) => {
    return Object.keys(filters).every((key) => {
      if (!filters[key]) return true
      return item[key] === filters[key]
    })
  })
}

// Local Storage Utilities
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error("Error setting localStorage:", error)
  }
}

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error("Error getting localStorage:", error)
    return defaultValue
  }
}

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error("Error removing localStorage:", error)
  }
}

// URL Utilities
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams()
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
      searchParams.append(key, params[key])
    }
  })
  return searchParams.toString()
}

export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString)
  const result = {}
  for (const [key, value] of params) {
    result[key] = value
  }
  return result
}

// Error Handling Utilities
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || "Server error occurred",
      status: error.response.status,
      data: error.response.data,
    }
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: "Network error. Please check your connection.",
      status: 0,
      data: null,
    }
  } else {
    // Something else happened
    return {
      message: error.message || "An unexpected error occurred",
      status: 0,
      data: null,
    }
  }
}

export const showNotification = (message, type = "info") => {
  // This would integrate with your notification system
  console.log(`${type.toUpperCase()}: ${message}`)
}

// AI Agent Utilities
export const formatAgentName = (agentName) => {
  return agentName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

export const getAgentColor = (agentName) => {
  const colors = {
    SchedulerAgent: "text-green-600 bg-green-100",
    UserAgent: "text-blue-600 bg-blue-100",
    ProviderAgent: "text-orange-600 bg-orange-100",
    PriorityAgent: "text-red-600 bg-red-100",
    NotificationAgent: "text-purple-600 bg-purple-100",
  }
  return colors[agentName] || "text-gray-600 bg-gray-100"
}

export const calculatePriorityScore = (appointment) => {
  let score = 0

  // Base score from priority
  switch (appointment.priority) {
    case APPOINTMENT_PRIORITY.HIGH:
      score += 100
      break
    case APPOINTMENT_PRIORITY.MEDIUM:
      score += 50
      break
    case APPOINTMENT_PRIORITY.LOW:
      score += 25
      break
  }

  // Add urgency factor
  if (appointment.urgency === "high") {
    score += 50
  } else if (appointment.urgency === "medium") {
    score += 25
  }

  // Add time factor (sooner appointments get higher score)
  const appointmentDate = new Date(`${appointment.date} ${appointment.time}`)
  const now = new Date()
  const hoursUntilAppointment = (appointmentDate - now) / (1000 * 60 * 60)

  if (hoursUntilAppointment < 24) {
    score += 30
  } else if (hoursUntilAppointment < 72) {
    score += 15
  }

  return Math.min(score, 200) // Cap at 200
}

// Export all utilities as default
export default {
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTime,
  isToday,
  isTomorrow,
  getAppointmentStatusColor,
  getPriorityColor,
  sortAppointmentsByDate,
  filterAppointmentsByStatus,
  getUpcomingAppointments,
  extractEntitiesFromText,
  generateVoiceResponse,
  validateEmail,
  validatePhone,
  validateAppointmentData,
  capitalizeFirst,
  formatName,
  getInitials,
  truncateText,
  groupBy,
  sortBy,
  filterBy,
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  buildQueryString,
  parseQueryString,
  handleApiError,
  showNotification,
  formatAgentName,
  getAgentColor,
  calculatePriorityScore,
}
