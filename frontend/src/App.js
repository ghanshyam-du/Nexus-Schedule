import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"

// Pages
import LandingPage from "./pages/LandingPage"
import Dashboard from "./pages/Dashboard"
import ProviderDashboard from "./pages/ProviderDashboard"
import Login from "./pages/Login"
import Demo from "./pages/Demo"

// Context
import { AuthProvider } from "./context/AuthContext"
import { SocketProvider } from "./context/SocketContext"

const theme = createTheme({
  palette: {
    primary: {
      main: "#2563eb",
    },
    secondary: {
      main: "#7c3aed",
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/provider" element={<ProviderDashboard />} />
                <Route path="/demo" element={<Demo />} />
              </Routes>
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
