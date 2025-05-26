"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { voiceAPI } from "../services/api"
import { useSocket } from "../context/SocketContext"

export default function VoiceInput({ onResponse, className = "" }) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [error, setError] = useState("")
  const [audioEnabled, setAudioEnabled] = useState(false)

  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const { sendVoiceInput, socketService } = useSocket()

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript || interimTranscript)

        if (finalTranscript) {
          processVoiceInput(finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    // Set up socket listeners for voice responses
    if (socketService) {
      socketService.onVoiceResponse((response) => {
        setAiResponse(response.aiResponse)
        setSuggestions(response.suggestions || [])
        setIsProcessing(false)
        if (onResponse) {
          onResponse(response)
        }
      })

      socketService.onVoiceProcessing((status) => {
        setIsProcessing(status.status === "processing")
      })

      socketService.onVoiceError((error) => {
        setError(error.message)
        setIsProcessing(false)
      })
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [socketService, onResponse])

  const startListening = async () => {
    setError("")
    setTranscript("")
    setAiResponse("")
    setSuggestions([])

    try {
      // Start speech recognition
      if (recognitionRef.current) {
        setIsListening(true)
        recognitionRef.current.start()
      }

      // Also start audio recording for backup
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorderRef.current = new MediaRecorder(stream)
        audioChunksRef.current = []

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        mediaRecorderRef.current.start()
      }
    } catch (error) {
      console.error("Error starting voice input:", error)
      setError("Could not access microphone")
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }

    setIsListening(false)
  }

  const processVoiceInput = async (text) => {
    setIsProcessing(true)

    try {
      // Send via socket for real-time processing
      if (socketService && socketService.isSocketConnected()) {
        sendVoiceInput(text)
      } else {
        // Fallback to API call
        const response = await voiceAPI.processText(text)
        setAiResponse(response.data.aiResponse)
        setSuggestions(response.data.suggestions || [])
        setIsProcessing(false)

        if (onResponse) {
          onResponse(response.data)
        }
      }
    } catch (error) {
      console.error("Voice processing error:", error)
      setError("Failed to process voice input")
      setIsProcessing(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setTranscript(suggestion)
    processVoiceInput(suggestion)
  }

  const playAudioResponse = () => {
    if (aiResponse && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(aiResponse)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <Card className={`shadow-lg border-0 bg-white/70 backdrop-blur-sm ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mic className="w-5 h-5" />
            <span>Voice Assistant</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setAudioEnabled(!audioEnabled)} className="p-2">
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Say something like: "Book me a dental appointment with Dr. Johnson next Tuesday at 10 AM"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Input Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`w-20 h-20 rounded-full transition-all duration-300 ${
              isListening ? "bg-red-500 hover:bg-red-600 animate-pulse scale-110" : "bg-blue-600 hover:bg-blue-700"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </Button>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center space-x-2">
          {isListening && (
            <Badge variant="secondary" className="bg-red-100 text-red-700 animate-pulse">
              Listening...
            </Badge>
          )}
          {isProcessing && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              Processing...
            </Badge>
          )}
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">You said:</p>
            <p className="font-medium text-gray-900">"{transcript}"</p>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center justify-center space-x-2 text-blue-600 py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">AI Agent processing your request...</span>
          </div>
        )}

        {/* AI Response */}
        {aiResponse && (
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-blue-600 mb-1">AI Assistant:</p>
                <p className="font-medium text-blue-800">"{aiResponse}"</p>
              </div>
              {audioEnabled && (
                <Button variant="ghost" size="sm" onClick={playAudioResponse} className="ml-2">
                  <Volume2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Quick responses:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
            <p className="text-sm text-red-600 mb-1">Error:</p>
            <p className="font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Click the microphone and speak clearly. The AI will help you book, reschedule, or cancel appointments.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
