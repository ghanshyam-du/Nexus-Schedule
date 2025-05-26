"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, RotateCcw, Calendar, MessageSquare, Brain, Zap } from "lucide-react"
import Link from "next/link"

type DemoStep = {
  id: number
  title: string
  description: string
  agent: string
  action: string
  result: string
  duration: number
}

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const demoSteps: DemoStep[] = [
    {
      id: 1,
      title: "User Voice Input",
      description: "User says: 'Book me a dental appointment with Dr. Johnson next Tuesday morning'",
      agent: "User",
      action: "voice_command",
      result: "Speech-to-text conversion completed",
      duration: 2000,
    },
    {
      id: 2,
      title: "AI Intent Processing",
      description: "AI Agent analyzes the voice input and extracts intent and entities",
      agent: "AI Agent",
      action: "intent_parsing",
      result: "Intent: book_appointment, Service: dental, Provider: Dr. Johnson, Time: Tuesday morning",
      duration: 1500,
    },
    {
      id: 3,
      title: "Availability Check",
      description: "Scheduler Agent checks Dr. Johnson's availability for Tuesday morning",
      agent: "Scheduler Agent",
      action: "availability_check",
      result: "Found 3 available slots: 9:00 AM, 10:30 AM, 11:15 AM",
      duration: 1000,
    },
    {
      id: 4,
      title: "Provider Agent Communication",
      description: "A2A communication with Provider Agent to confirm optimal slot",
      agent: "Provider Agent",
      action: "slot_negotiation",
      result: "Recommended 10:30 AM slot based on provider preferences",
      duration: 1200,
    },
    {
      id: 5,
      title: "Priority Assessment",
      description: "AI evaluates appointment priority using MCP (Model Context Protocol)",
      agent: "Priority Agent",
      action: "priority_scoring",
      result: "Priority: Medium (routine checkup, preferred provider)",
      duration: 800,
    },
    {
      id: 6,
      title: "Booking Confirmation",
      description: "System confirms the appointment and sends notifications",
      agent: "Notification Agent",
      action: "booking_confirmation",
      result: "Appointment booked for Tuesday 10:30 AM, notifications sent",
      duration: 1000,
    },
  ]

  const startDemo = () => {
    setIsPlaying(true)
    setCurrentStep(0)
    setProgress(0)
    runDemoStep(0)
  }

  const runDemoStep = (stepIndex: number) => {
    if (stepIndex >= demoSteps.length) {
      setIsPlaying(false)
      return
    }

    const step = demoSteps[stepIndex]
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (step.duration / 50)
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setCurrentStep(stepIndex + 1)
            setProgress(0)
            runDemoStep(stepIndex + 1)
          }, 500)
          return 100
        }
        return newProgress
      })
    }, 50)
  }

  const resetDemo = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    setProgress(0)
  }

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case "User":
        return "bg-blue-100 text-blue-700"
      case "AI Agent":
        return "bg-purple-100 text-purple-700"
      case "Scheduler Agent":
        return "bg-green-100 text-green-700"
      case "Provider Agent":
        return "bg-orange-100 text-orange-700"
      case "Priority Agent":
        return "bg-red-100 text-red-700"
      case "Notification Agent":
        return "bg-indigo-100 text-indigo-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">NexusSchedule</span>
          </Link>
          <Link href="/dashboard">
            <Button>Try Live Demo</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Interactive Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch how NexusSchedule's AI agents communicate and collaborate to book appointments seamlessly
          </p>
        </div>

        {/* Demo Controls */}
        <Card className="max-w-2xl mx-auto mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>AI Agent Workflow Demo</span>
            </CardTitle>
            <CardDescription>Experience the complete Agent-to-Agent communication flow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Button onClick={startDemo} disabled={isPlaying} className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Start Demo
              </Button>
              <Button onClick={resetDemo} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Progress Bar */}
            {isPlaying && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Step {currentStep + 1} of {demoSteps.length}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Steps */}
        <div className="max-w-4xl mx-auto space-y-6">
          {demoSteps.map((step, index) => (
            <Card
              key={step.id}
              className={`transition-all duration-500 ${
                index === currentStep
                  ? "ring-2 ring-blue-500 shadow-lg scale-105"
                  : index < currentStep
                    ? "opacity-75"
                    : "opacity-50"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        index === currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <Badge className={getAgentColor(step.agent)}>{step.agent}</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{step.description}</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Action</p>
                        <p className="text-sm text-blue-600">{step.action}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Result</p>
                        <p className="text-sm text-green-600">{step.result}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Features Highlight */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Key AI Features Demonstrated</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">A2A Communication</h3>
                <p className="text-sm text-gray-600">Agents communicate to negotiate optimal solutions</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Brain className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Intent Processing</h3>
                <p className="text-sm text-gray-600">Natural language understanding and entity extraction</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Priority Scoring</h3>
                <p className="text-sm text-gray-600">MCP-based intelligent priority assessment</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Smart Scheduling</h3>
                <p className="text-sm text-gray-600">AI-optimized appointment slot selection</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Experience It Live?</h3>
              <p className="mb-6 opacity-90">
                Try the full NexusSchedule platform with real voice commands and AI interactions
              </p>
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Launch Live Demo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
