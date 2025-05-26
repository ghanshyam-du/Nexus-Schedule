import { type NextRequest, NextResponse } from "next/server"

// Simulated notification system
const notifications = [
  {
    id: "1",
    userId: "user1",
    type: "booking_confirmed",
    title: "Appointment Confirmed",
    message: "Your appointment with Dr. Sarah Johnson has been confirmed for Jan 15 at 10:30 AM",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    priority: "medium",
  },
  {
    id: "2",
    userId: "user1",
    type: "reminder",
    title: "Appointment Reminder",
    message: "Reminder: Massage appointment tomorrow at 2:00 PM",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    priority: "low",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  let userNotifications = notifications
  if (userId) {
    userNotifications = notifications.filter((notif) => notif.userId === userId)
  }

  return NextResponse.json({
    success: true,
    notifications: userNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  })
}

export async function POST(request: NextRequest) {
  try {
    const { userId, type, title, message, priority = "medium" } = await request.json()

    const newNotification = {
      id: (notifications.length + 1).toString(),
      userId,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      priority,
    }

    notifications.push(newNotification)

    // Simulate real-time notification delivery
    // In a real app, this would use WebSockets or Server-Sent Events

    return NextResponse.json({
      success: true,
      notification: newNotification,
    })
  } catch (error) {
    console.error("Notification error:", error)
    return NextResponse.json({ success: false, error: "Failed to send notification" }, { status: 500 })
  }
}
