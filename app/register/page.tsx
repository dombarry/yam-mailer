"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import YamLogo from "@/components/YamLogo"

export default function Register() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    // Get email and invite code from URL parameters
    const emailParam = searchParams.get("email")
    const codeParam = searchParams.get("code")

    if (emailParam) setEmail(emailParam)
    if (codeParam) setInviteCode(codeParam)

    // Validate the invite code
    const validateInvite = async () => {
      if (!emailParam || !codeParam) {
        setError("Invalid invitation link")
        return
      }

      try {
        const response = await fetch(
          `/api/auth/validate-invite?email=${encodeURIComponent(emailParam)}&code=${encodeURIComponent(codeParam)}`,
        )
        const data = await response.json()

        if (data.valid) {
          setIsValid(true)
        } else {
          setError("This invitation is invalid or has expired")
        }
      } catch (error) {
        setError("Failed to validate invitation")
      }
    }

    validateInvite()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          password,
          inviteCode,
        }),
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
        setError(data.error || "Registration failed")
      }
    } catch (error) {
      setError("An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-amber-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="bg-amber-600 text-white">
            <div className="flex justify-center mb-4">
              <YamLogo />
            </div>
            <CardTitle className="text-center">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="mb-4">{error || "This invitation link is invalid or has expired."}</p>
              <Button onClick={() => router.push("/login")} className="bg-amber-600 hover:bg-amber-700">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-amber-600 text-white">
          <div className="flex justify-center mb-4">
            <YamLogo />
          </div>
          <CardTitle className="text-center">Complete Your Registration</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} readOnly className="bg-gray-100" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
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

            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Complete Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

