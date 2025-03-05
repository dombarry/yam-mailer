"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { User } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function UserManagement() {
  const [users, setUsers] = useState<Omit<User, "passwordHash">[]>([])
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    building: "",
    role: "dr",
    password: "",
  })
  const [resetPassword, setResetPassword] = useState({
    userId: "",
    newPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users/list")
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      setMessage({ type: "error", text: "Failed to fetch users" })
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "User created successfully" })
        fetchUsers()
        setNewUser({
          email: "",
          name: "",
          building: "",
          role: "dr",
          password: "",
        })
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "Failed to create user" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (userId: string) => {
    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const response = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          newPassword: resetPassword.newPassword,
        }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Password reset successfully" })
        setResetPassword({ userId: "", newPassword: "" })
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "Failed to reset password" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" })
    } finally {
      setIsLoading(false)
    }
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
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Full name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="Email address"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Building</label>
              <Select
                value={newUser.building}
                onValueChange={(value) => setNewUser({ ...newUser, building: value })}
                required
              >
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
              <label className="text-sm font-medium">Role</label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value as "admin" | "dr" })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dr">Desk Receptionist</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Set password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No users found</p>
            ) : (
              users.map((user) => (
                <div key={user._id} className="p-4 border rounded space-y-4">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      <span className="capitalize">{user.building}</span> -{" "}
                      {user.role === "admin" ? "Admin" : "Desk Receptionist"}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="password"
                      placeholder="New password"
                      value={resetPassword.userId === user._id ? resetPassword.newPassword : ""}
                      onChange={(e) =>
                        setResetPassword({
                          userId: user._id!,
                          newPassword: e.target.value,
                        })
                      }
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleResetPassword(user._id!)}
                      disabled={!resetPassword.newPassword || resetPassword.userId !== user._id || isLoading}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {isLoading && resetPassword.userId === user._id ? "Resetting..." : "Reset Password"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

