const express = require("express")
const multer = require("multer")
const authMiddleware = require("../middleware/auth")
const voiceService = require("../services/voiceService")
const aiAgentService = require("../services/aiAgentService")

const router = express.Router()

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true)
    } else {
      cb(new Error("Only audio files are allowed"), false)
    }
  },
})

// Process voice input (text)
router.post("/process-text", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ message: "Text input is required" })
    }

    // Process intent with AI agent
    const intentResult = await aiAgentService.processIntent(text)

    // Generate AI response
    const aiResponse = await aiAgentService.generateResponse(intentResult, req.user)

    res.json({
      success: true,
      originalText: text,
      intent: intentResult,
      aiResponse: aiResponse.message,
      suggestions: aiResponse.suggestions || [],
      nextActions: aiResponse.nextActions || [],
    })
  } catch (error) {
    console.error("Voice text processing error:", error)
    res.status(500).json({ message: "Error processing voice input" })
  }
})

// Process voice input (audio file)
router.post("/process-audio", [authMiddleware, upload.single("audio")], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Audio file is required" })
    }

    // Convert speech to text
    const transcript = await voiceService.speechToText(req.file.buffer)

    if (!transcript) {
      return res.status(400).json({ message: "Could not process audio" })
    }

    // Process intent with AI agent
    const intentResult = await aiAgentService.processIntent(transcript)

    // Generate AI response
    const aiResponse = await aiAgentService.generateResponse(intentResult, req.user)

    // Convert response to speech (optional)
    let audioResponse = null
    if (req.body.generateAudio === "true") {
      audioResponse = await voiceService.textToSpeech(aiResponse.message)
    }

    res.json({
      success: true,
      transcript,
      intent: intentResult,
      aiResponse: aiResponse.message,
      audioResponse: audioResponse ? audioResponse.toString("base64") : null,
      suggestions: aiResponse.suggestions || [],
      nextActions: aiResponse.nextActions || [],
    })
  } catch (error) {
    console.error("Voice audio processing error:", error)
    res.status(500).json({ message: "Error processing audio input" })
  }
})

// Get voice processing history
router.get("/history", authMiddleware, async (req, res) => {
  try {
    // This would typically come from a VoiceHistory model
    // For now, return mock data
    const history = [
      {
        id: "1",
        timestamp: new Date(),
        input: "Book me a dental appointment",
        intent: "book_appointment",
        response: "I found available slots for dental appointments...",
      },
    ]

    res.json({
      success: true,
      history,
    })
  } catch (error) {
    console.error("Get voice history error:", error)
    res.status(500).json({ message: "Error retrieving voice history" })
  }
})

module.exports = router
