"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Calendar, Users, Zap, Brain, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiResponse, setAiResponse] = useState("")
  const recognitionRef = (useRef < SpeechRecognition) | (null > null)

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event) => {
        const speechResult = event.results[0][0].transcript
        setTranscript(speechResult)
        processVoiceInput(speechResult)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      setTranscript("")
      setAiResponse("")
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const processVoiceInput = async (input: string) => {
    setIsProcessing(true)

    // Simulate AI processing
    setTimeout(() => {
      const responses = [
        "I found Dr. Sarah Johnson available for a dental checkup next Tuesday at 10:30 AM. Would you like me to book this appointment?",
        "I see you want a massage appointment. I found 3 available slots this Friday: 2:00 PM, 4:30 PM, and 6:00 PM with Maya Wellness Spa. Which time works best?",
        "Perfect! I've found an available consultation slot with Dr. Michael Chen on Wednesday at 3:00 PM. Shall I proceed with the booking?",
        "I understand you need to reschedule. Let me check alternative slots for your appointment with Dr. Lisa Park. I found Tuesday 11:00 AM and Thursday 2:30 PM available.",
      ]

      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      setAiResponse(randomResponse)
      setIsProcessing(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NexusSchedule
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
            🚀 AI-Powered Scheduling Revolution
          </Badge>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Your Voice, Your Schedule
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Intelligent appointments, effortlessly booked. Experience the future of scheduling with voice-powered AI
            that understands, negotiates, and optimizes your time.
          </p>

          {/* Voice Input Section */}
          <Card className="max-w-2xl mx-auto mb-12 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Mic className="w-5 h-5" />
                <span>Try Voice Booking</span>
              </CardTitle>
              <CardDescription>
                Say something like: "Book me a dental appointment with Dr. Johnson next Tuesday at 10 AM"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={isListening ? stopListening : startListening}
                  className={`w-20 h-20 rounded-full ${
                    isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </Button>
              </div>

              {transcript && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">You said:</p>
                  <p className="font-medium">"{transcript}"</p>
                </div>
              )}

              {isProcessing && (
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>AI Agent processing...</span>
                </div>
              )}

              {aiResponse && (
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-blue-600 mb-1">AI Agent Response:</p>
                  <p className="font-medium text-blue-800">"{aiResponse}"</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Get Started
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Intelligent Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Powered by advanced AI agents that communicate, negotiate, and optimize scheduling in real-time
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Voice-First Booking</CardTitle>
              <CardDescription>
                Natural language processing understands your scheduling needs from simple voice commands
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Agentic AI</CardTitle>
              <CardDescription>
                AI agents communicate with each other to resolve conflicts and optimize scheduling automatically
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Real-time Notifications</CardTitle>
              <CardDescription>
                Instant updates via multiple channels keep everyone informed of changes and confirmations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Dynamic Conflict Resolution</CardTitle>
              <CardDescription>
                AI agents negotiate alternative slots when conflicts arise, finding optimal solutions for all parties
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>Multi-Role Support</CardTitle>
              <CardDescription>
                Seamless experience for clients, service providers, and administrators with role-specific dashboards
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>Adaptive Learning</CardTitle>
              <CardDescription>
                System learns from patterns and preferences to provide increasingly personalized scheduling suggestions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Scheduling?</h3>
            <p className="mb-6 opacity-90">Join the future of appointment booking with AI-powered voice scheduling</p>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Scheduling Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 NexusSchedule. Intelligent appointments, effortlessly booked.</p>
        </div>
      </footer>
    </div>
  )
}
