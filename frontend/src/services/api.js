import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/me"),
  updatePreferences: (preferences) => api.put("/auth/preferences", { preferences }),
}

// Appointments API
export const appointmentsAPI = {
  getAppointments: (params = {}) => api.get("/appointments", { params }),
  createAppointment: (appointmentData) => api.post("/appointments", appointmentData),
  updateAppointmentStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
  rescheduleAppointment: (id, date, time) => api.put(`/appointments/${id}/reschedule`, { date, time }),
  cancelAppointment: (id, reason) => api.delete(`/appointments/${id}`, { data: { reason } }),
}

// Voice API
export const voiceAPI = {
  processText: (text) => api.post("/voice/process-text", { text }),
  processAudio: (audioFile, generateAudio = false) => {
    const formData = new FormData()
    formData.append("audio", audioFile)
    formData.append("generateAudio", generateAudio)
    return api.post("/voice/process-audio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
  getHistory: () => api.get("/voice/history"),
}

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get("/notifications"),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  sendNotification: (notificationData) => api.post("/notifications", notificationData),
}

// Providers API
export const providersAPI = {
  getProviders: (params = {}) => api.get("/providers", { params }),
  getProvider: (id) => api.get(`/providers/${id}`),
  updateAvailability: (availability) => api.put("/providers/availability", { availability }),
  getServices: (providerId) => api.get(`/providers/${providerId}/services`),
}

export default api
