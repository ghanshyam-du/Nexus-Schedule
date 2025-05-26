"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Brain, MoreHorizontal, Phone, Mail } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { appointmentsAPI } from "../services/api"
import { useSocket } from "../context/SocketContext"

export default function AppointmentCard({ appointment, userRole = "client", onUpdate }) {
  const [isLoading, setIsLoading] = useState(false)
  const { updateAppointmentStatus } = useSocket()

  const getStatusIcon = (status) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    setIsLoading(true)
    try {
      await appointmentsAPI.updateAppointmentStatus(appointment.id, newStatus)

      // Update via socket for real-time updates
      updateAppointmentStatus(appointment.id, newStatus, appointment.clientId, appointment.providerId)

      if (onUpdate) {
        onUpdate({ ...appointment, status: newStatus })
      }
    } catch (error) {
      console.error("Error updating appointment status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReschedule = () => {
    // This would open a reschedule modal
    console.log("Reschedule appointment:", appointment.id)
  }

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      await handleStatusUpdate("cancelled")
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getPersonInfo = () => {
    if (userRole === "client") {
      return {
        name: appointment.providerName || appointment.provider,
        role: "Provider",
        avatar: appointment.providerAvatar,
      }
    } else {
      return {
        name: appointment.clientName || appointment.client,
        role: "Client",
        avatar: appointment.clientAvatar,
      }
    }
  }

  const personInfo = getPersonInfo()

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Left Section - Person Info & Details */}
          <div className="flex items-start space-x-4 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarImage src={personInfo.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {personInfo.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {getStatusIcon(appointment.status)}
                <h3 className="font-semibold text-lg truncate">{appointment.service}</h3>
                {appointment.aiNegotiated && (
                  <Badge className="bg-purple-100 text-purple-700 text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Optimized
                  </Badge>
                )}
              </div>

              <p className="text-gray-600 mb-2">
                with {personInfo.name} • {personInfo.role}
              </p>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(appointment.date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{appointment.time}</span>
                </div>
              </div>

              {appointment.notes && (
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-3">{appointment.notes}</p>
              )}

              {/* Contact Info (for providers viewing client appointments) */}
              {userRole === "provider" && appointment.clientPhone && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{appointment.clientPhone}</span>
                  </div>
                  {appointment.clientEmail && (
                    <div className="flex items-center space-x-1">
                      <Mail className="w-3 h-3" />
                      <span>{appointment.clientEmail}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Status & Actions */}
          <div className="flex flex-col items-end space-y-3">
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(appointment.priority)}>{appointment.priority} priority</Badge>
              <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {appointment.status === "pending" && userRole === "provider" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate("confirmed")}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate("cancelled")}
                    disabled={isLoading}
                  >
                    Decline
                  </Button>
                </>
              )}

              {appointment.status === "confirmed" && (
                <>
                  <Button variant="outline" size="sm" onClick={handleReschedule} disabled={isLoading}>
                    Reschedule
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel} disabled={isLoading}>
                    Cancel
                  </Button>
                </>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => console.log("View details")}>View Details</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => console.log("Send message")}>Send Message</DropdownMenuItem>
                  {userRole === "provider" && (
                    <DropdownMenuItem onClick={() => console.log("View client profile")}>
                      View Client Profile
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => console.log("Export to calendar")}>
                    Export to Calendar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* AI Negotiation Log */}
            {appointment.negotiationLog && appointment.negotiationLog.length > 0 && (
              <div className="text-xs text-gray-500">
                <p>AI Actions: {appointment.negotiationLog.length}</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Negotiation Details (Expandable) */}
        {appointment.aiNegotiated && appointment.negotiationLog && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <details className="group">
              <summary className="cursor-pointer text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1">
                <Brain className="w-4 h-4" />
                <span>View AI Optimization Details</span>
              </summary>
              <div className="mt-2 space-y-2">
                {appointment.negotiationLog.map((log, index) => (
                  <div key={index} className="text-xs bg-purple-50 p-2 rounded">
                    <span className="font-medium">{log.agent}:</span> {log.action}
                    {log.details && <span className="text-gray-600"> - {JSON.stringify(log.details)}</span>}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
