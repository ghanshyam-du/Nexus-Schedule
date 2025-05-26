"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, Settings, CheckCircle, XCircle, AlertCircle, Brain } from "lucide-react"
import Link from "next/link"

interface Appointment {
  id: string
  clientName: string
  service: string
  date: string
  time: string
  status: "confirmed" | "pending" | "cancelled"
  priority: "high" | "medium" | "low"
  aiNegotiated: boolean
}

interface AvailabilitySlot {
  day: string
  startTime: string
  endTime: string
  enabled: boolean
}

export default function ProviderDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      clientName: "John Doe",
      service: "Dental Checkup",
      date: "2024-01-15",
      time: "10:30 AM",
      status: "confirmed",
      priority: "medium",
      aiNegotiated: false,
    },
    {
      id: "2",
      clientName: "Sarah Smith",
      service: "Root Canal",
      date: "2024-01-16",
      time: "2:00 PM",
      status: "pending",
      priority: "high",
      aiNegotiated: true,
    },
    {
      id: "3",
      clientName: "Mike Johnson",
      service: "Cleaning",
      date: "2024-01-18",
      time: "11:00 AM",
      status: "confirmed",
      priority: "low",
      aiNegotiated: true,
    },
  ])

  const [availability, setAvailability] = useState<AvailabilitySlot[]>([
    { day: "Monday", startTime: "09:00", endTime: "17:00", enabled: true },
    { day: "Tuesday", startTime: "09:00", endTime: "17:00", enabled: true },
    { day: "Wednesday", startTime: "09:00", endTime: "17:00", enabled: true },
    { day: "Thursday", startTime: "09:00", endTime: "17:00", enabled: true },
    { day: "Friday", startTime: "09:00", endTime: "15:00", enabled: true },
    { day: "Saturday", startTime: "10:00", endTime: "14:00", enabled: false },
    { day: "Sunday", startTime: "10:00", endTime: "14:00", enabled: false },
  ])

  const [aiSettings, setAiSettings] = useState({
    autoAcceptBookings: true,
    allowRescheduling: true,
    priorityThreshold: "medium",
    maxDailyBookings: 8,
  })

  const handleAppointmentAction = (id: string, action: "accept" | "reject") => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: action === "accept" ? "confirmed" : "cancelled" } : apt)),
    )
  }

  const updateAvailability = (index: number, field: keyof AvailabilitySlot, value: any) => {
    setAvailability((prev) => prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)))
  }

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

  const pendingAppointments = appointments.filter((apt) => apt.status === "pending").length
  const aiNegotiatedCount = appointments.filter((apt) => apt.aiNegotiated).length

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
            <Badge className="bg-purple-100 text-purple-700">Provider</Badge>
          </Link>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
          <p className="text-gray-600">Dr. Sarah Johnson - Dental Practice</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Appointments</p>
                  <p className="text-2xl font-bold">6</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingAppointments}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI Negotiated</p>
                  <p className="text-2xl font-bold text-purple-600">{aiNegotiatedCount}</p>
                </div>
                <Brain className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-green-600">24</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appointments">
              Appointments
              {pendingAppointments > 0 && (
                <Badge className="ml-2 bg-yellow-500 text-white">{pendingAppointments}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Appointment Requests</h2>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Manage Services
              </Button>
            </div>

            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {appointment.clientName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(appointment.status)}
                          <div>
                            <h3 className="font-semibold">{appointment.clientName}</h3>
                            <p className="text-sm text-gray-600">{appointment.service}</p>
                            {appointment.aiNegotiated && (
                              <Badge className="mt-1 bg-purple-100 text-purple-700 text-xs">
                                <Brain className="w-3 h-3 mr-1" />
                                AI Negotiated
                              </Badge>
                            )}
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
                        {appointment.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleAppointmentAction(appointment.id, "accept")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAppointmentAction(appointment.id, "reject")}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <h2 className="text-2xl font-bold">Set Your Availability</h2>
            <Card>
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>Configure your working hours for each day</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {availability.map((slot, index) => (
                  <div key={slot.day} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-20">
                      <Label className="font-medium">{slot.day}</Label>
                    </div>
                    <Switch
                      checked={slot.enabled}
                      onCheckedChange={(checked) => updateAvailability(index, "enabled", checked)}
                    />
                    {slot.enabled && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm">From:</Label>
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateAvailability(index, "startTime", e.target.value)}
                            className="w-32"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm">To:</Label>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateAvailability(index, "endTime", e.target.value)}
                            className="w-32"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <Button className="w-full">Save Availability</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-settings" className="space-y-6">
            <h2 className="text-2xl font-bold">AI Agent Configuration</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Automation Settings</CardTitle>
                  <CardDescription>Configure how the AI agent handles bookings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Auto-accept bookings</Label>
                      <p className="text-sm text-gray-600">AI automatically confirms suitable appointments</p>
                    </div>
                    <Switch
                      checked={aiSettings.autoAcceptBookings}
                      onCheckedChange={(checked) => setAiSettings((prev) => ({ ...prev, autoAcceptBookings: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Allow rescheduling</Label>
                      <p className="text-sm text-gray-600">AI can negotiate alternative time slots</p>
                    </div>
                    <Switch
                      checked={aiSettings.allowRescheduling}
                      onCheckedChange={(checked) => setAiSettings((prev) => ({ ...prev, allowRescheduling: checked }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium">Max daily bookings</Label>
                    <Input
                      type="number"
                      value={aiSettings.maxDailyBookings}
                      onChange={(e) =>
                        setAiSettings((prev) => ({ ...prev, maxDailyBookings: Number.parseInt(e.target.value) }))
                      }
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Agent Activity</CardTitle>
                  <CardDescription>Recent AI actions on your behalf</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="text-sm font-medium text-green-800">Auto-Accepted Booking</p>
                      <p className="text-xs text-green-600">John Doe - Dental Checkup for Jan 15</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-blue-800">Negotiated Alternative</p>
                      <p className="text-xs text-blue-600">Offered 3 alternative slots to Sarah Smith</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <p className="text-sm font-medium text-purple-800">Priority Adjustment</p>
                      <p className="text-xs text-purple-600">Elevated urgent appointment priority</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Provider Analytics</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>AI Auto-acceptance rate:</span>
                      <Badge className="bg-green-100 text-green-700">85%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Average response time:</span>
                      <Badge>2.3 minutes</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancellation rate:</span>
                      <Badge className="bg-yellow-100 text-yellow-700">8%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Dental Checkup</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cleaning</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Root Canal</span>
                      <span className="font-medium">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other</span>
                      <span className="font-medium">10%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Peak Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>10:00 AM - 12:00 PM</span>
                      <Badge className="bg-red-100 text-red-700">High</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>2:00 PM - 4:00 PM</span>
                      <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>4:00 PM - 6:00 PM</span>
                      <Badge className="bg-green-100 text-green-700">Low</Badge>
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
