"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, Bell, Settings, LogOut, User, Brain, Activity } from "lucide-react"
import Link from "next/link"
import { useAuth } from "../context/AuthContext"
import { useSocket } from "../context/SocketContext"

export default function Navbar() {
  const { user, logout } = useAuth()
  const { notifications, isConnected } = useSocket()
  const [showNotifications, setShowNotifications] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NexusSchedule
              </span>
            </Link>

            {/* Connection Status */}
            <div className="ml-4 flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-xs text-gray-500">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                {user.role === "provider" && (
                  <Link href="/provider">
                    <Button variant="ghost" size="sm">
                      Provider Portal
                    </Button>
                  </Link>
                )}
                <Link href="/demo">
                  <Button variant="ghost" size="sm">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Demo
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="p-3 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && <p className="text-sm text-gray-600">{unreadCount} unread</p>}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map((notification) => (
                          <DropdownMenuItem key={notification.id} className="p-3 border-b last:border-b-0">
                            <div className="flex-1">
                              <p className={`text-sm ${!notification.read ? "font-medium" : ""}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled>
                          <p className="text-sm text-gray-500">No notifications</p>
                        </DropdownMenuItem>
                      )}
                    </div>
                    {notifications.length > 5 && (
                      <div className="p-3 border-t">
                        <Link href="/dashboard?tab=notifications">
                          <Button variant="ghost" size="sm" className="w-full">
                            View All Notifications
                          </Button>
                        </Link>
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                        <Badge variant="outline" className="w-fit">
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard?tab=analytics">
                        <Activity className="mr-2 h-4 w-4" />
                        <span>AI Insights</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/dashboard">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-4 py-2 space-y-1">
          {user && (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Dashboard
                </Button>
              </Link>
              {user.role === "provider" && (
                <Link href="/provider">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Provider Portal
                  </Button>
                </Link>
              )}
              <Link href="/demo">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Demo
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
