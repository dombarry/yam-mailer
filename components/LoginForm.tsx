"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import YamLogo from "./YamLogo"
import { useRouter } from "next/navigation" // Changed from next/router to next/navigation

interface LoginFormProps {
  type: "admin" | "dr"
}

export default function LoginForm({ type }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [building, setBuilding] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, building }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect based on role
        if (data.user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/")
        }
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-amber-600 text-white">
        <div className="flex justify-center mb-4">
          <YamLogo />
        </div>
        <CardTitle className="text-center">{type === "admin" ? "Admin Log In" : "DR Log In"}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium">Building</label>
            <Select value={building} onValueChange={setBuilding}>
              <SelectTrigger>
                <SelectValue placeholder="Select building" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cobeen">Cobeen</SelectItem>
                <SelectItem value="mashuda">Mashuda</SelectItem>
                <SelectItem value="carpenter">Carpenter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

