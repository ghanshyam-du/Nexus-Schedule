const axios = require("axios")

class VoiceService {
  constructor() {
    this.whisperApiKey = process.env.WHISPER_API_KEY || process.env.OPENAI_API_KEY
    this.elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
  }

  async speechToText(audioBuffer) {
    try {
      if (!this.whisperApiKey) {
        // Fallback: return mock transcript for demo
        return "Book me a dental appointment with Dr. Johnson next Tuesday morning"
      }

      // Use OpenAI Whisper API
      const formData = new FormData()
      formData.append("file", audioBuffer, "audio.wav")
      formData.append("model", "whisper-1")

      const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
        headers: {
          Authorization: `Bearer ${this.whisperApiKey}`,
          "Content-Type": "multipart/form-data",
        },
      })

      return response.data.text
    } catch (error) {
      console.error("Speech to text error:", error)
      // Return mock transcript for demo
      return "Book me a dental appointment with Dr. Johnson next Tuesday morning"
    }
  }

  async textToSpeech(text) {
    try {
      if (!this.elevenLabsApiKey) {
        // Return null if no API key (client will handle text display)
        return null
      }

      // Use ElevenLabs API
      const response = await axios.post(
        "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", // Default voice ID
        {
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        },
        {
          headers: {
            Accept: "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": this.elevenLabsApiKey,
          },
          responseType: "arraybuffer",
        },
      )

      return Buffer.from(response.data)
    } catch (error) {
      console.error("Text to speech error:", error)
      return null
    }
  }

  // Simulate real-time voice processing
  async processRealTimeVoice(audioStream, callback) {
    try {
      // This would handle real-time audio streaming
      // For now, simulate with intervals
      const mockTranscripts = [
        "Book me",
        "Book me a dental",
        "Book me a dental appointment",
        "Book me a dental appointment with Dr. Johnson",
      ]

      for (let i = 0; i < mockTranscripts.length; i++) {
        setTimeout(() => {
          callback({
            transcript: mockTranscripts[i],
            isFinal: i === mockTranscripts.length - 1,
          })
        }, i * 500)
      }
    } catch (error) {
      console.error("Real-time voice processing error:", error)
      callback({ error: "Voice processing failed" })
    }
  }
}

module.exports = new VoiceService()
