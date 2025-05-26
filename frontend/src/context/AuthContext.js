"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { authAPI } from "../services/api"
import socketService from "../services/socketService"

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true, error: null }
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }
    case "CLEAR_ERROR":
      return { ...state, error: null }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const response = await authAPI.getProfile()
          dispatch({
            type: "AUTH_SUCCESS",
            payload: {
              user: response.data.user,
              token,
            },
          })

          // Connect to socket
          socketService.connect(token)
        } catch (error) {
          localStorage.removeItem("token")
          dispatch({ type: "AUTH_FAILURE", payload: "Session expired" })
        }
      } else {
        dispatch({ type: "AUTH_FAILURE", payload: null })
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      dispatch({ type: "AUTH_START" })

      const response = await authAPI.login(credentials)
      const { user, token } = response.data

      localStorage.setItem("token", token)

      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user, token },
      })

      // Connect to socket
      socketService.connect(token)

      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      dispatch({ type: "AUTH_FAILURE", payload: message })
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: "AUTH_START" })

      const response = await authAPI.register(userData)
      const { user, token } = response.data

      localStorage.setItem("token", token)

      dispatch({
        type: "AUTH_SUCCESS",
        payload: { user, token },
      })

      // Connect to socket
      socketService.connect(token)

      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed"
      dispatch({ type: "AUTH_FAILURE", payload: message })
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    socketService.disconnect()
    dispatch({ type: "LOGOUT" })
  }

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData })
  }

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthContext
