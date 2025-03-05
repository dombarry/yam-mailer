"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle } from "lucide-react"
import YamLogo from "@/components/YamLogo"

export default function Bootstrap() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [building, setBuilding] = useState("cobeen")
  const [bootstrapKey, setBootstrapKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: "", text: "" })

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          password,
          building,
          bootstrapKey,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Initial admin user created successfully. You can now log in.",
        })

        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create admin user" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-amber-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-amber-600 text-white">
          <div className="flex justify-center mb-4">
            <YamLogo />
          </div>
          <CardTitle className="text-center">Initial Setup</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {message.text && (
              <div
                className={`p-4 rounded flex items-center gap-2 ${
                  message.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                }`}
              >
                {message.type === "error" ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                {message.text}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email address"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin full name"
                required
              />
            </div>

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
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bootstrap Key</label>
              <Input
                type="password"
                value={bootstrapKey}
                onChange={(e) => setBootstrapKey(e.target.value)}
                placeholder="Enter the bootstrap key"
                required
              />
              <p className="text-xs text-gray-500">
                This is a security measure to prevent unauthorized setup. The key should be set in your environment
                variables.
              </p>
            </div>

            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
              {isLoading ? "Creating Admin User..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

