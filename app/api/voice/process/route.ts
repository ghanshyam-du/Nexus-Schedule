import { type NextRequest, NextResponse } from "next/server"

// Simulated AI intent processing
function processIntent(transcript: string) {
  const lowerTranscript = transcript.toLowerCase()

  // Extract intent and entities
  let intent = "unknown"
  let entities = {}

  if (
    lowerTranscript.includes("book") ||
    lowerTranscript.includes("schedule") ||
    lowerTranscript.includes("appointment")
  ) {
    intent = "book_appointment"

    // Extract service type
    if (lowerTranscript.includes("dental") || lowerTranscript.includes("dentist")) {
      entities = { ...entities, service: "dental_checkup" }
    } else if (lowerTranscript.includes("massage")) {
      entities = { ...entities, service: "massage_therapy" }
    } else if (lowerTranscript.includes("consultation")) {
      entities = { ...entities, service: "consultation" }
    }

    // Extract provider
    if (lowerTranscript.includes("johnson") || lowerTranscript.includes("dr johnson")) {
      entities = { ...entities, provider: "Dr. Sarah Johnson" }
    } else if (lowerTranscript.includes("chen") || lowerTranscript.includes("dr chen")) {
      entities = { ...entities, provider: "Dr. Michael Chen" }
    } else if (lowerTranscript.includes("maya") || lowerTranscript.includes("spa")) {
      entities = { ...entities, provider: "Maya Wellness Spa" }
    }

    // Extract time preferences
    if (lowerTranscript.includes("morning")) {
      entities = { ...entities, timePreference: "morning" }
    } else if (lowerTranscript.includes("afternoon")) {
      entities = { ...entities, timePreference: "afternoon" }
    } else if (lowerTranscript.includes("evening")) {
      entities = { ...entities, timePreference: "evening" }
    }

    // Extract urgency
    if (lowerTranscript.includes("urgent") || lowerTranscript.includes("emergency")) {
      entities = { ...entities, urgency: "high" }
    } else if (lowerTranscript.includes("soon") || lowerTranscript.includes("asap")) {
      entities = { ...entities, urgency: "medium" }
    } else {
      entities = { ...entities, urgency: "low" }
    }
  } else if (lowerTranscript.includes("reschedule") || lowerTranscript.includes("change")) {
    intent = "reschedule_appointment"
  } else if (lowerTranscript.includes("cancel")) {
    intent = "cancel_appointment"
  }

  return {
    intent,
    entities,
    confidence: 0.85,
    originalText: transcript,
  }
}

// Simulated AI response generation
function generateResponse(processedIntent: any) {
  const { intent, entities } = processedIntent

  if (intent === "book_appointment") {
    const service = entities.service || "appointment"
    const provider = entities.provider || "available provider"
    const timePreference = entities.timePreference || "your preferred time"

    if (entities.urgency === "high") {
      return `I understand this is urgent. Let me find the earliest available slot for ${service} with ${provider}. I found an emergency slot today at 4:30 PM. Would you like me to book this?`
    } else {
      return `I can help you book ${service} with ${provider}. I found several available slots for ${timePreference}. Would you prefer Tuesday at 10:30 AM, Wednesday at 2:00 PM, or Friday at 11:00 AM?`
    }
  } else if (intent === "reschedule_appointment") {
    return "I can help you reschedule your appointment. Let me check your upcoming bookings and find alternative slots. Which appointment would you like to reschedule?"
  } else if (intent === "cancel_appointment") {
    return "I can help you cancel your appointment. Let me pull up your upcoming bookings. Which appointment would you like to cancel? I'll also check if there are any cancellation policies that apply."
  } else {
    return "I'm sorry, I didn't quite understand that. Could you please try again? You can say things like 'Book me a dental appointment' or 'Reschedule my appointment with Dr. Johnson'."
  }
}

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()

    if (!transcript) {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 })
    }

    // Process the voice input with AI
    const processedIntent = processIntent(transcript)

    // Generate AI response
    const aiResponse = generateResponse(processedIntent)

    // Simulate AI agent communication delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      processedIntent,
      aiResponse,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Voice processing error:", error)
    return NextResponse.json({ error: "Failed to process voice input" }, { status: 500 })
  }
}
