const axios = require("axios")

class AIAgentService {
  constructor() {
    this.aiAgentUrl = process.env.AI_AGENT_URL || "http://localhost:5001"
    this.openaiApiKey = process.env.OPENAI_API_KEY
  }

  async processIntent(text) {
    try {
      // If AI agent service is available, use it
      if (this.aiAgentUrl) {
        try {
          const response = await axios.post(
            `${this.aiAgentUrl}/process-intent`,
            {
              text,
            },
            { timeout: 5000 },
          )

          return response.data
        } catch (error) {
          console.log("AI agent service unavailable, using fallback")
        }
      }

      // Fallback: local intent processing
      return this.processIntentLocally(text)
    } catch (error) {
      console.error("Intent processing error:", error)
      return this.processIntentLocally(text)
    }
  }

  processIntentLocally(text) {
    const lowerText = text.toLowerCase()

    let intent = "unknown"
    const entities = {}
    const confidence = 0.8

    // Intent detection
    if (lowerText.includes("book") || lowerText.includes("schedule") || lowerText.includes("appointment")) {
      intent = "book_appointment"
    } else if (lowerText.includes("reschedule") || lowerText.includes("change")) {
      intent = "reschedule_appointment"
    } else if (lowerText.includes("cancel")) {
      intent = "cancel_appointment"
    } else if (lowerText.includes("find") || lowerText.includes("search")) {
      intent = "find_provider"
    }

    // Entity extraction
    if (lowerText.includes("dental") || lowerText.includes("dentist")) {
      entities.service = "dental_checkup"
    } else if (lowerText.includes("massage")) {
      entities.service = "massage_therapy"
    } else if (lowerText.includes("consultation")) {
      entities.service = "consultation"
    }

    // Provider extraction
    if (lowerText.includes("johnson") || lowerText.includes("dr johnson")) {
      entities.provider = "Dr. Sarah Johnson"
    } else if (lowerText.includes("chen") || lowerText.includes("dr chen")) {
      entities.provider = "Dr. Michael Chen"
    } else if (lowerText.includes("maya") || lowerText.includes("spa")) {
      entities.provider = "Maya Wellness Spa"
    }

    // Time extraction
    if (lowerText.includes("morning")) {
      entities.timePreference = "morning"
    } else if (lowerText.includes("afternoon")) {
      entities.timePreference = "afternoon"
    } else if (lowerText.includes("evening")) {
      entities.timePreference = "evening"
    }

    // Date extraction
    if (lowerText.includes("today")) {
      entities.date = new Date().toISOString().split("T")[0]
    } else if (lowerText.includes("tomorrow")) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      entities.date = tomorrow.toISOString().split("T")[0]
    } else if (lowerText.includes("tuesday")) {
      entities.dayOfWeek = "tuesday"
    } else if (lowerText.includes("wednesday")) {
      entities.dayOfWeek = "wednesday"
    }

    // Urgency detection
    if (lowerText.includes("urgent") || lowerText.includes("emergency")) {
      entities.urgency = "high"
    } else if (lowerText.includes("soon") || lowerText.includes("asap")) {
      entities.urgency = "medium"
    } else {
      entities.urgency = "low"
    }

    return {
      intent,
      entities,
      confidence,
      originalText: text,
    }
  }

  async generateResponse(intentResult, user) {
    try {
      const { intent, entities } = intentResult

      switch (intent) {
        case "book_appointment":
          return this.generateBookingResponse(entities, user)
        case "reschedule_appointment":
          return this.generateRescheduleResponse(entities, user)
        case "cancel_appointment":
          return this.generateCancelResponse(entities, user)
        case "find_provider":
          return this.generateProviderSearchResponse(entities, user)
        default:
          return {
            message:
              "I'm sorry, I didn't quite understand that. Could you please try again? You can say things like 'Book me a dental appointment' or 'Reschedule my appointment with Dr. Johnson'.",
            suggestions: [
              "Book a dental appointment",
              "Find available massage therapists",
              "Reschedule my appointment",
              "Cancel my appointment",
            ],
          }
      }
    } catch (error) {
      console.error("Response generation error:", error)
      return {
        message: "I'm experiencing some technical difficulties. Please try again in a moment.",
        suggestions: [],
      }
    }
  }

  generateBookingResponse(entities, user) {
    const service = entities.service || "appointment"
    const provider = entities.provider || "available provider"
    const timePreference = entities.timePreference || "your preferred time"
    const urgency = entities.urgency || "low"

    if (urgency === "high") {
      return {
        message: `I understand this is urgent. Let me find the earliest available slot for ${service} with ${provider}. I found an emergency slot today at 4:30 PM. Would you like me to book this?`,
        suggestions: ["Yes, book it", "Find other times", "Call the provider"],
        nextActions: ["confirm_booking", "find_alternatives", "contact_provider"],
      }
    }

    return {
      message: `I can help you book ${service} with ${provider}. I found several available slots for ${timePreference}. Would you prefer Tuesday at 10:30 AM, Wednesday at 2:00 PM, or Friday at 11:00 AM?`,
      suggestions: ["Tuesday 10:30 AM", "Wednesday 2:00 PM", "Friday 11:00 AM", "Show more times"],
      nextActions: ["select_slot", "find_more_slots"],
    }
  }

  generateRescheduleResponse(entities, user) {
    return {
      message:
        "I can help you reschedule your appointment. Let me check your upcoming bookings and find alternative slots. Which appointment would you like to reschedule?",
      suggestions: ["Dental appointment on Tuesday", "Massage on Friday", "Show all appointments"],
      nextActions: ["select_appointment", "view_appointments"],
    }
  }

  generateCancelResponse(entities, user) {
    return {
      message:
        "I can help you cancel your appointment. Let me pull up your upcoming bookings. Which appointment would you like to cancel? I'll also check if there are any cancellation policies that apply.",
      suggestions: ["Dental appointment on Tuesday", "Massage on Friday", "Show all appointments"],
      nextActions: ["select_appointment", "view_appointments"],
    }
  }

  generateProviderSearchResponse(entities, user) {
    const service = entities.service || "service"

    return {
      message: `I found several providers for ${service} in your area. Here are the top-rated options with availability this week:`,
      suggestions: ["Dr. Sarah Johnson (Dentistry)", "Maya Wellness Spa (Massage)", "Dr. Michael Chen (General)"],
      nextActions: ["select_provider", "view_more_providers"],
    }
  }

  async findAlternativeSlots(appointmentData) {
    try {
      // Simulate AI agent finding alternatives
      const alternatives = [
        {
          date: "2024-01-17",
          time: "10:00 AM",
          provider: appointmentData.providerId,
          confidence: 0.9,
        },
        {
          date: "2024-01-17",
          time: "2:30 PM",
          provider: appointmentData.providerId,
          confidence: 0.8,
        },
        {
          date: "2024-01-18",
          time: "11:00 AM",
          provider: appointmentData.providerId,
          confidence: 0.7,
        },
      ]

      return alternatives
    } catch (error) {
      console.error("Find alternatives error:", error)
      return []
    }
  }

  async scheduleWithAI(appointmentData) {
    try {
      // Simulate AI agent scheduling
      const result = {
        success: true,
        appointmentId: "ai_" + Date.now(),
        negotiationLog: [
          {
            agent: "SchedulerAgent",
            action: "slot_search",
            timestamp: new Date(),
            result: "Found 3 available slots",
          },
          {
            agent: "ProviderAgent",
            action: "availability_check",
            timestamp: new Date(),
            result: "Confirmed availability",
          },
          {
            agent: "UserAgent",
            action: "preference_match",
            timestamp: new Date(),
            result: "Optimal slot selected",
          },
        ],
      }

      return result
    } catch (error) {
      console.error("AI scheduling error:", error)
      throw error
    }
  }
}

module.exports = new AIAgentService()
