// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/me",
    PREFERENCES: "/auth/preferences",
  },
  APPOINTMENTS: {
    BASE: "/appointments",
    STATUS: (id) => `/appointments/${id}/status`,
    RESCHEDULE: (id) => `/appointments/${id}/reschedule`,
    CANCEL: (id) => `/appointments/${id}`,
  },
  VOICE: {
    PROCESS_TEXT: "/voice/process-text",
    PROCESS_AUDIO: "/voice/process-audio",
    HISTORY: "/voice/history",
  },
  NOTIFICATIONS: {
    BASE: "/notifications",
    READ: (id) => `/notifications/${id}/read`,
  },
  PROVIDERS: {
    BASE: "/providers",
    DETAIL: (id) => `/providers/${id}`,
    AVAILABILITY: "/providers/availability",
    SERVICES: (id) => `/providers/${id}/services`,
  },
}

// Socket Events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",

  // Voice
  VOICE_INPUT: "voice_input",
  VOICE_RESPONSE: "voice_response",
  VOICE_PROCESSING: "voice_processing",
  VOICE_ERROR: "voice_error",

  // Appointments
  BOOK_APPOINTMENT: "book_appointment",
  BOOKING_CONFIRMED: "booking_confirmed",
  BOOKING_ERROR: "booking_error",
  UPDATE_APPOINTMENT_STATUS: "update_appointment_status",
  APPOINTMENT_STATUS_UPDATED: "appointment_status_updated",

  // Agents
  AGENT_COMMUNICATION: "agent_communication",
  GET_AGENT_STATUS: "get_agent_status",
  AGENT_STATUS: "agent_status",

  // Notifications
  SUBSCRIBE_NOTIFICATIONS: "subscribe_notifications",
  NEW_NOTIFICATION: "new_notification",

  // Provider
  UPDATE_AVAILABILITY: "update_availability",
  AVAILABILITY_UPDATED: "availability_updated",
  PROVIDER_AVAILABILITY_UPDATED: "provider_availability_updated",

  // General
  ERROR: "error",
}

// User Roles
export const USER_ROLES = {
  CLIENT: "client",
  PROVIDER: "provider",
  ADMIN: "admin",
}

// Appointment Status
export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
}

// Appointment Priority
export const APPOINTMENT_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
}

// Notification Types
export const NOTIFICATION_TYPES = {
  BOOKING_CREATED: "booking_created",
  BOOKING_CONFIRMED: "booking_confirmed",
  BOOKING_CANCELLED: "booking_cancelled",
  BOOKING_RESCHEDULED: "booking_rescheduled",
  REMINDER: "reminder",
  AI_OPTIMIZATION: "ai_optimization",
  AI_NEGOTIATION: "ai_negotiation",
  URGENT: "urgent",
}

// AI Agent Types
export const AGENT_TYPES = {
  SCHEDULER: "SchedulerAgent",
  USER: "UserAgent",
  PROVIDER: "ProviderAgent",
  PRIORITY: "PriorityAgent",
  NOTIFICATION: "NotificationAgent",
}

// Voice Commands
export const VOICE_COMMANDS = {
  BOOK: ["book", "schedule", "appointment", "reserve"],
  RESCHEDULE: ["reschedule", "change", "move", "update"],
  CANCEL: ["cancel", "delete", "remove"],
  FIND: ["find", "search", "look for", "show me"],
  STATUS: ["status", "check", "what's", "when is"],
}

// Time Preferences
export const TIME_PREFERENCES = {
  MORNING: "morning",
  AFTERNOON: "afternoon",
  EVENING: "evening",
}

// Days of Week
export const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

// Service Types
export const SERVICE_TYPES = {
  DENTAL: "dental_checkup",
  MASSAGE: "massage_therapy",
  CONSULTATION: "consultation",
  CLEANING: "cleaning",
  THERAPY: "therapy",
  CHECKUP: "checkup",
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  AUTH_ERROR: "Authentication failed. Please log in again.",
  PERMISSION_ERROR: "You don't have permission to perform this action.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  VOICE_NOT_SUPPORTED: "Voice recognition is not supported in your browser.",
  MICROPHONE_ERROR: "Could not access microphone. Please check permissions.",
}

// Success Messages
export const SUCCESS_MESSAGES = {
  APPOINTMENT_BOOKED: "Appointment booked successfully!",
  APPOINTMENT_UPDATED: "Appointment updated successfully!",
  APPOINTMENT_CANCELLED: "Appointment cancelled successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
  PREFERENCES_SAVED: "Preferences saved successfully!",
}

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  PREFERENCES: "preferences",
  VOICE_SETTINGS: "voice_settings",
}

// Default Values
export const DEFAULTS = {
  APPOINTMENT_DURATION: 60, // minutes
  REMINDER_TIME: 24, // hours before appointment
  MAX_DAILY_BOOKINGS: 10,
  VOICE_TIMEOUT: 5000, // milliseconds
  API_TIMEOUT: 10000, // milliseconds
}

// Feature Flags
export const FEATURES = {
  VOICE_INPUT: true,
  AI_AGENTS: true,
  REAL_TIME_NOTIFICATIONS: true,
  AUDIO_RESPONSES: true,
  AGENT_COMMUNICATION_LOG: true,
  PRIORITY_SCORING: true,
  ADAPTIVE_LEARNING: true,
}

export default {
  API_ENDPOINTS,
  SOCKET_EVENTS,
  USER_ROLES,
  APPOINTMENT_STATUS,
  APPOINTMENT_PRIORITY,
  NOTIFICATION_TYPES,
  AGENT_TYPES,
  VOICE_COMMANDS,
  TIME_PREFERENCES,
  DAYS_OF_WEEK,
  SERVICE_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  DEFAULTS,
  FEATURES,
}
