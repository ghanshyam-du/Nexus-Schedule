"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, MessageSquare, Calendar, Zap, Activity, RefreshCw } from "lucide-react"
import { useSocket } from "../context/SocketContext"

export default function AIAgentStatus({ className = "" }) {
  const { agentStatus, agentCommunications, isConnected, clearAgentCommunications, socketService } = useSocket()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshAgentStatus = async () => {
    setIsRefreshing(true)
    if (socketService) {
      socketService.getAgentStatus()
    }
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const getAgentIcon = (agentName) => {
    switch (agentName.toLowerCase()) {
      case "scheduleragent":
      case "scheduler agent":
        return <Calendar className="w-4 h-4" />
      case "useragent":
      case "user agent":
        return <MessageSquare className="w-4 h-4" />
      case "provideragent":
      case "provider agent":
        return <Brain className="w-4 h-4" />
      case "priorityagent":
      case "priority agent":
        return <Zap className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "busy":
        return "bg-yellow-100 text-yellow-700"
      case "inactive":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getLoadColor = (load) => {
    if (load < 0.3) return "bg-green-500"
    if (load < 0.7) return "bg-yellow-500"
    return "bg-red-500"
  }

  const formatAgentName = (name) => {
    return name.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Agent Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span>AI Agent Status</span>
              </CardTitle>
              <CardDescription>Real-time status of all AI agents in the system</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <Button variant="outline" size="sm" onClick={refreshAgentStatus} disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(agentStatus).length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(agentStatus).map(([agentName, status]) => (
                <div key={agentName} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getAgentIcon(agentName)}
                      <span className="font-medium">{formatAgentName(agentName)}</span>
                    </div>
                    <Badge className={getStatusColor(status.status)}>{status.status}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Load:</span>
                      <span className="font-medium">{Math.round(status.load * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getLoadColor(status.load)}`}
                        style={{ width: `${status.load * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No agent status data available</p>
              <Button variant="outline" size="sm" onClick={refreshAgentStatus} className="mt-2">
                Refresh Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Communication Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>Agent Communication Log</span>
              </CardTitle>
              <CardDescription>Real-time Agent-to-Agent (A2A) communication</CardDescription>
            </div>
            {agentCommunications.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearAgentCommunications}>
                Clear Log
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {agentCommunications.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {agentCommunications.map((comm, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 agent-communication"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getAgentIcon(comm.agent)}
                      <span className="font-medium text-sm">{comm.agent}</span>
                      <Badge variant="outline" className="text-xs">
                        {comm.action}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(comm.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-gray-700">{comm.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No agent communications yet</p>
              <p className="text-sm">Agent communications will appear here in real-time</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
