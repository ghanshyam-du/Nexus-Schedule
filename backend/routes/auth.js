const express = require("express")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const authMiddleware = require("../middleware/auth")

const router = express.Router()

// Register user
router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").isIn(["client", "provider"]).withMessage("Role must be client or provider"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { name, email, password, role, phone } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" })
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        role,
        phone,
      })

      await user.save()

      // Generate JWT token
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "fallback_secret", {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      })

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ message: "Server error during registration" })
    }
  },
)

// Login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password } = req.body

      // Find user by email
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "fallback_secret", {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      })

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Server error during login" })
    }
  },
)

// Get current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    res.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user preferences
router.put("/preferences", authMiddleware, async (req, res) => {
  try {
    const { preferences } = req.body

    const user = await User.findByIdAndUpdate(req.user.userId, { preferences }, { new: true }).select("-password")

    res.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Update preferences error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
