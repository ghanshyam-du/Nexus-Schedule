import { type NextRequest, NextResponse } from "next/server"

// Simulated database
const appointments = [
  {
    id: "1",
    clientId: "user1",
    providerId: "provider1",
    clientName: "John Doe",
    providerName: "Dr. Sarah Johnson",
    service: "Dental Checkup",
    date: "2024-01-15",
    time: "10:30 AM",
    status: "confirmed",
    priority: "medium",
    aiNegotiated: false,
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "2",
    clientId: "user2",
    providerId: "provider1",
    clientName: "Sarah Smith",
    providerName: "Dr. Sarah Johnson",
    service: "Root Canal",
    date: "2024-01-16",
    time: "2:00 PM",
    status: "pending",
    priority: "high",
    aiNegotiated: true,
    createdAt: "2024-01-10T14:00:00Z",
  },
]

// Simulated AI scheduling logic
function findAvailableSlots(service: string, provider: string, preferences: any) {
  const slots = [
    { date: "2024-01-17", time: "10:00 AM", provider: "Dr. Sarah Johnson" },
    { date: "2024-01-17", time: "2:30 PM", provider: "Dr. Sarah Johnson" },
    { date: "2024-01-18", time: "11:00 AM", provider: "Dr. Michael Chen" },
    { date: "2024-01-19", time: "9:00 AM", provider: "Maya Wellness Spa" },
    { date: "2024-01-19", time: "4:00 PM", provider: "Maya Wellness Spa" },
  ]

  return slots.filter((slot) => !provider || slot.provider === provider).slice(0, 3)
}

function calculatePriority(urgency: string, service: string): "high" | "medium" | "low" {
  if (urgency === "high" || service.includes("emergency")) return "high"
  if (urgency === "medium" || service.includes("consultation")) return "medium"
  return "low"
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const providerId = searchParams.get("providerId")

  let filteredAppointments = appointments

  if (userId) {
    filteredAppointments = appointments.filter((apt) => apt.clientId === userId)
  } else if (providerId) {
    filteredAppointments = appointments.filter((apt) => apt.providerId === providerId)
  }

  return NextResponse.json({
    success: true,
    appointments: filteredAppointments,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, service, provider, preferences, urgency = "low" } = body

    // AI Agent processing
    const availableSlots = findAvailableSlots(service, provider, preferences)

    if (availableSlots.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No available slots found",
        alternatives: [],
      })
    }

    // Create new appointment with AI optimization
    const newAppointment = {
      id: (appointments.length + 1).toString(),
      clientId,
      providerId: "provider1", // Simplified for demo
      clientName: "John Doe", // Would come from user data
      providerName: availableSlots[0].provider,
      service,
      date: availableSlots[0].date,
      time: availableSlots[0].time,
      status: urgency === "high" ? "confirmed" : "pending",
      priority: calculatePriority(urgency, service),
      aiNegotiated: true,
      createdAt: new Date().toISOString(),
    }

    appointments.push(newAppointment)

    // Simulate AI agent communication
    const agentResponse = {
      success: true,
      appointment: newAppointment,
      alternatives: availableSlots.slice(1),
      aiMessage:
        urgency === "high"
          ? `Emergency appointment confirmed for ${newAppointment.date} at ${newAppointment.time}`
          : `Appointment request submitted. Provider will confirm within 2 hours.`,
      negotiationLog: [
        {
          agent: "SchedulerAgent",
          action: "slot_search",
          result: `Found ${availableSlots.length} available slots`,
        },
        {
          agent: "ProviderAgent",
          action: "availability_check",
          result: "Confirmed availability",
        },
        {
          agent: "UserAgent",
          action: "preference_match",
          result: "Optimal slot selected",
        },
      ],
    }

    return NextResponse.json(agentResponse)
  } catch (error) {
    console.error("Appointment booking error:", error)
    return NextResponse.json({ success: false, error: "Failed to book appointment" }, { status: 500 })
  }
}
