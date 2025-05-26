class VoiceService {
  constructor() {
    this.recognition = null
    this.isListening = false
    this.onResultCallback = null
    this.onErrorCallback = null
    this.onEndCallback = null
  }

  // Initialize speech recognition
  initialize() {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.recognition = new SpeechRecognition()

      this.recognition.continuous = false
      this.recognition.interimResults = true
      this.recognition.lang = "en-US"
      this.recognition.maxAlternatives = 1

      this.recognition.onresult = (event) => {
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

        if (this.onResultCallback) {
          this.onResultCallback({
            finalTranscript,
            interimTranscript,
            isFinal: finalTranscript.length > 0,
          })
        }
      }

      this.recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        this.isListening = false
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error)
        }
      }

      this.recognition.onend = () => {
        this.isListening = false
        if (this.onEndCallback) {
          this.onEndCallback()
        }
      }

      return true
    }

    return false
  }

  // Start listening
  startListening(callbacks = {}) {
    if (!this.recognition) {
      if (!this.initialize()) {
        if (callbacks.onError) {
          callbacks.onError("Speech recognition not supported")
        }
        return false
      }
    }

    this.onResultCallback = callbacks.onResult
    this.onErrorCallback = callbacks.onError
    this.onEndCallback = callbacks.onEnd

    try {
      this.recognition.start()
      this.isListening = true
      return true
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      if (callbacks.onError) {
        callbacks.onError(error.message)
      }
      return false
    }
  }

  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  // Check if currently listening
  getIsListening() {
    return this.isListening
  }

  // Text to speech
  speak(text, options = {}) {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = options.rate || 0.9
      utterance.pitch = options.pitch || 1
      utterance.volume = options.volume || 0.8
      utterance.lang = options.lang || "en-US"

      if (options.onStart) {
        utterance.onstart = options.onStart
      }
      if (options.onEnd) {
        utterance.onend = options.onEnd
      }
      if (options.onError) {
        utterance.onerror = options.onError
      }

      speechSynthesis.speak(utterance)
      return true
    }

    console.warn("Speech synthesis not supported")
    return false
  }

  // Stop speaking
  stopSpeaking() {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
    }
  }

  // Get available voices
  getVoices() {
    if ("speechSynthesis" in window) {
      return speechSynthesis.getVoices()
    }
    return []
  }

  // Check if speech recognition is supported
  isSupported() {
    return typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
  }

  // Check if text-to-speech is supported
  isTTSSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window
  }

  // Record audio (for sending to server)
  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
          resolve(audioBlob)
        }

        mediaRecorder.onerror = (event) => {
          reject(event.error)
        }

        mediaRecorder.start()

        // Return control functions
        resolve({
          stop: () => {
            mediaRecorder.stop()
            stream.getTracks().forEach((track) => track.stop())
          },
          mediaRecorder,
        })
      })
    } catch (error) {
      console.error("Error starting audio recording:", error)
      throw error
    }
  }

  // Convert audio blob to base64
  audioToBase64(audioBlob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result.split(",")[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(audioBlob)
    })
  }
}

export default new VoiceService()
