"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, User, Building } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (userType) => {
    setIsLoading(true)

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false)
      if (userType === "provider") {
        router.push("/provider")
      } else {
        router.push("/dashboard")
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NexusSchedule
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <Tabs defaultValue="client" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="client" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Client</span>
                </TabsTrigger>
                <TabsTrigger value="provider" className="flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>Provider</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="client" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Email</Label>
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="john@example.com"
                      defaultValue="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-password">Password</Label>
                    <Input id="client-password" type="password" placeholder="••••••••" defaultValue="password" />
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => handleLogin("client")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In as Client"}
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Demo credentials: john@example.com / password</p>
                </div>
              </TabsContent>

              <TabsContent value="provider" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider-email">Email</Label>
                    <Input
                      id="provider-email"
                      type="email"
                      placeholder="dr.johnson@clinic.com"
                      defaultValue="dr.johnson@clinic.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider-password">Password</Label>
                    <Input id="provider-password" type="password" placeholder="••••••••" defaultValue="password" />
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={() => handleLogin("provider")}
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In as Provider"}
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Demo credentials: dr.johnson@clinic.com / password</p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
