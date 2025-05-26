const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

// Import routes
const authRoutes = require("./routes/auth")
const appointmentRoutes = require("./routes/appointments")
const voiceRoutes = require("./routes/voice")
const notificationRoutes = require("./routes/notifications")
const providerRoutes = require("./routes/providers")

// Import middleware
const errorHandler = require("./middleware/errorHandler")
const authMiddleware = require("./middleware/auth")

// Import socket handlers
const socketHandler = require("./socket/socketHandler")

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Database connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/nexusschedule", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/voice", voiceRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/providers", providerRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use(errorHandler)

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Socket.IO setup
const io = require("socket.io")(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

socketHandler(io)

module.exports = app
