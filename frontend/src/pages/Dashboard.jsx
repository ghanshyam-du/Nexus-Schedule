"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Mic, Bell, Plus, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

type Appointment = {
  id: string
  service: string
  provider: string
  date: string
  time: string
  status: "confirmed" | "pending" | "cancelled"
  priority: "high" | "medium" | "low"
}

type Notification = {
  id: string
  type: "booking" | "reminder" | "cancellation" | "reschedule"
  message: string
  timestamp: string
  read: boolean
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      service: "Dental Checkup",
      provider: "Dr. Sarah Johnson",
      date: "2024-01-15",
      time: "10:30 AM",
      status: "confirmed",
      priority: "medium",
    },
    {
      id: "2",
      service: "Massage Therapy",
      provider: "Maya Wellness Spa",
      date: "2024-01-18",
      time: "2:00 PM",
      status: "pending",
      priority: "low",
    },
    {
      id: "3",
      service: "Consultation",
      provider: "Dr. Michael Chen",
      date: "2024-01-20",
      time: "3:00 PM",
      status: "confirmed",
      priority: "high",
    },
  ])

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "booking",
      message: "Your appointment with Dr. Sarah Johnson has been confirmed for Jan 15 at 10:30 AM",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      type: "reminder",
      message: "Reminder: Massage appointment tomorrow at 2:00 PM",
      timestamp: "1 day ago",
      read: false,
    },
    {
      id: "3",
      type: "reschedule",
      message: "AI Agent found a better slot for your consultation - moved to 3:00 PM",
      timestamp: "3 days ago",
      read: true,
    },
  ])

  const [isListening, setIsListening] = useState(false)
  const [voiceCommand, setVoiceCommand] = useState("")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700"
      case "medium":
        return "bg-yellow-100 text-yellow-700"
      case "low":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const unreadNotifications = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">NexusSchedule</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
          <p className="text-gray-600">Manage your appointments and schedule with AI assistance</p>
        </div>

        {/* Quick Voice Booking */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mic className="w-5 h-5 text-blue-600" />
              <span>Quick Voice Booking</span>
            </CardTitle>
            <CardDescription>Say "Book appointment" or "Reschedule my appointment" to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsListening(!isListening)}
                className={`${isListening ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                <Mic className="w-4 h-4 mr-2" />
                {isListening ? "Stop Listening" : "Start Voice Command"}
              </Button>
              {voiceCommand && (
                <div className="flex-1 p-2 bg-white rounded border">
                  <span className="text-sm text-gray-600">Command: </span>
                  <span className="font-medium">{voiceCommand}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {unreadNotifications > 0 && <Badge className="ml-2 bg-red-500 text-white">{unreadNotifications}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="analytics">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Appointments</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Book New Appointment
              </Button>
            </div>

            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(appointment.status)}
                          <div>
                            <h3 className="font-semibold">{appointment.service}</h3>
                            <p className="text-sm text-gray-600">with {appointment.provider}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getPriorityColor(appointment.priority)}>
                          {appointment.priority} priority
                        </Badge>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button variant="outline" size="sm">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <h2 className="text-2xl font-bold">Notifications</h2>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className={`${!notification.read ? "border-blue-200 bg-blue-50" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`${!notification.read ? "font-medium" : ""}`}>{notification.message}</p>
                        <p className="text-sm text-gray-500 mt-1">{notification.timestamp}</p>
                      </div>
                      {!notification.read && <Badge className="bg-blue-500">New</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <h2 className="text-2xl font-bold">Your Providers</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Dr. Sarah Johnson", specialty: "Dentistry", rating: 4.9, nextAvailable: "Tomorrow 10:00 AM" },
                {
                  name: "Maya Wellness Spa",
                  specialty: "Massage Therapy",
                  rating: 4.8,
                  nextAvailable: "Today 4:30 PM",
                },
                {
                  name: "Dr. Michael Chen",
                  specialty: "General Medicine",
                  rating: 4.7,
                  nextAvailable: "Friday 2:00 PM",
                },
              ].map((provider, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                        <AvatarFallback>
                          {provider.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <CardDescription>{provider.specialty}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <span className="font-medium">⭐ {provider.rating}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Next Available:</span>
                        <span className="font-medium text-green-600">{provider.nextAvailable}</span>
                      </div>
                      <Button className="w-full mt-4" size="sm">
                        Book Appointment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">AI Insights & Analytics</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Patterns</CardTitle>
                  <CardDescription>AI-detected preferences and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Preferred booking time:</span>
                      <Badge>10:00 AM - 12:00 PM</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Most booked service:</span>
                      <Badge>Dental Checkups</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Cancellation rate:</span>
                      <Badge className="bg-green-100 text-green-700">5% (Low)</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>AI optimization score:</span>
                      <Badge className="bg-blue-100 text-blue-700">92%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Agent Activity</CardTitle>
                  <CardDescription>Recent AI-driven optimizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="text-sm font-medium text-green-800">Conflict Resolved</p>
                      <p className="text-xs text-green-600">AI found alternative slot when Dr. Chen was unavailable</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-blue-800">Schedule Optimized</p>
                      <p className="text-xs text-blue-600">Moved appointment to reduce travel time between locations</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <p className="text-sm font-medium text-purple-800">Preference Learned</p>
                      <p className="text-xs text-purple-600">AI detected preference for morning appointments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
