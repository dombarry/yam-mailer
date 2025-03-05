"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, RefreshCw, UserPlus } from "lucide-react"
import type { PreAuthorizedUser } from "@/lib/types"

export default function InviteUsers() {
  const [invites, setInvites] = useState<PreAuthorizedUser[]>([])
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"admin" | "dr">("dr")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingInvites, setIsLoadingInvites] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const fetchInvites = async () => {
    setIsLoadingInvites(true)
    try {
      const response = await fetch("/api/auth/pre-authorize")
      if (response.ok) {
        const data = await response.json()
        setInvites(data)
      }
    } catch (error) {
      console.error("Failed to fetch invites", error)
    } finally {
      setIsLoadingInvites(false)
    }
  }

  // Fetch invites on component mount
  useEffect(() => {
    fetchInvites()
  }, []) //Fixed useEffect dependency issue

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const response = await fetch("/api/auth/pre-authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          role,
          building: "cobeen", // This will be the admin's building in a real implementation
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Invitation sent successfully" })
        setEmail("")
        setName("")
        setRole("dr")
        await fetchInvites() // Refresh the invites list immediately
      } else {
        setMessage({ type: "error", text: data.error || "Failed to send invitation" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Invite New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Name (Optional)</label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="User's name" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={role} onValueChange={(value) => setRole(value as "admin" | "dr")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr">Desk Receptionist</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pending Invitations</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchInvites} disabled={isLoadingInvites}>
            <RefreshCw className={`h-4 w-4 ${isLoadingInvites ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No pending invitations</p>
          ) : (
            <div className="space-y-4">
              {invites.map((invite) => (
                <div key={invite._id} className="p-4 border rounded">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      {invite.name && <p className="text-sm text-gray-500">{invite.name}</p>}
                      <p className="text-sm text-gray-500">
                        Role: {invite.role === "admin" ? "Administrator" : "Desk Receptionist"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Sent: {formatDate(invite.createdAt.toString())}</p>
                      <p className="text-xs text-gray-500">Expires: {formatDate(invite.expiresAt.toString())}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

