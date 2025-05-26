"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Check, X, Calendar, MessageSquare, AlertTriangle, Info } from "lucide-react"
import { useSocket } from "../context/SocketContext"
import { notificationsAPI } from "../services/api"

export default function NotificationPanel({ className = "" }) {
  const { notifications, markNotificationAsRead } = useSocket()
  const [localNotifications, setLocalNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load initial notifications
    loadNotifications()
  }, [])

  useEffect(() => {
    // Merge socket notifications with local notifications
    if (notifications.length > 0) {
      setLocalNotifications((prev) => {
        const newNotifications = notifications.filter(
          (socketNotif) => !prev.some((localNotif) => localNotif.id === socketNotif.id),
        )
        return [...newNotifications, ...prev]
      })
    }
  }, [notifications])

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      const response = await notificationsAPI.getNotifications()
      setLocalNotifications(response.data.notifications || [])
    } catch (error) {
      console.error("Error loading notifications:", error)
      // Use mock data for demo
      setLocalNotifications([
        {
          id: "1",
          type: "booking_confirmed",
          title: "Appointment Confirmed",
          message: "Your appointment with Dr. Sarah Johnson has been confirmed for Jan 15 at 10:30 AM",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: "medium",
        },
        {
          id: "2",
          type: "reminder",
          title: "Appointment Reminder",
          message: "Reminder: Massage appointment tomorrow at 2:00 PM",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: false,
          priority: "low",
        },
        {
          id: "3",
          type: "ai_optimization",
          title: "AI Schedule Optimization",
          message: "AI Agent found a better slot for your consultation - moved to 3:00 PM",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          priority: "medium",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "booking_confirmed":
      case "booking_created":
        return <Calendar className="w-4 h-4 text-green-600" />
      case "booking_cancelled":
        return <X className="w-4 h-4 text-red-600" />
      case "reminder":
        return <Bell className="w-4 h-4 text-blue-600" />
      case "ai_optimization":
      case "ai_negotiation":
        return <MessageSquare className="w-4 h-4 text-purple-600" />
      case "urgent":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      default:
        return <Info className="w-4 h-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId)
      markNotificationAsRead(notificationId)
      setLocalNotifications((prev) =>
        prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
      // Still update locally for demo
      setLocalNotifications((prev) =>
        prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)),
      )
    }
  }

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = localNotifications.filter((notif) => !notif.read)
    for (const notif of unreadNotifications) {
      await handleMarkAsRead(notif.id)
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      return `${diffInMinutes} minutes ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} days ago`
    }
  }

  const unreadCount = localNotifications.filter((notif) => !notif.read).length

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
              {unreadCount > 0 && <Badge className="bg-red-500 text-white ml-2">{unreadCount}</Badge>}
            </CardTitle>
            <CardDescription>Stay updated with your appointments and AI optimizations</CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : localNotifications.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {localNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg transition-all duration-200 ${
                  !notification.read ? "border-blue-200 bg-blue-50 shadow-sm" : "border-gray-200 bg-white opacity-75"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-medium text-sm ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>
                          {notification.title}
                        </h4>
                        <Badge className={getPriorityColor(notification.priority)} variant="outline">
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className={`text-sm ${!notification.read ? "text-gray-700" : "text-gray-500"}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">{formatTimestamp(notification.timestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-sm">You'll see appointment updates and AI optimizations here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
