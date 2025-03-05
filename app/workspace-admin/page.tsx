"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, Building, Send } from "lucide-react"
import type { JwtPayload } from "@/lib/jwt"
import { useRouter } from "next/navigation"

export default function WorkspaceAdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<JwtPayload | null>(null)
  const [newBuilding, setNewBuilding] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminName, setAdminName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  // Test email state
  const [testEmail, setTestEmail] = useState("")
  const [testSubject, setTestSubject] = useState("Test Email from Yam")
  const [testContent, setTestContent] = useState("This is a test email from the Yam Mailroom System.")
  const [sendingTest, setSendingTest] = useState(false)
  const [testResult, setTestResult] = useState({ type: "", text: "" })

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)

          // Redirect if not workspace admin
          if (data.user.role !== "workspace_admin") {
            router.push("/")
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data", error)
      }
    }

    fetchUser()
  }, [router])

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ type: "", text: "" })

    try {
      const response = await fetch("/api/workspace-admin/create-building", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingName: newBuilding.toLowerCase(),
          adminEmail,
          adminName,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: "Building created successfully" })
        setNewBuilding("")
        setAdminEmail("")
        setAdminName("")
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create building" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendingTest(true)
    setTestResult({ type: "", text: "" })

    try {
      const response = await fetch("/api/workspace-admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          subject: testSubject,
          content: testContent,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setTestResult({ type: "success", text: "Test email sent successfully" })
      } else {
        setTestResult({ type: "error", text: data.error || "Failed to send test email" })
      }
    } catch (error) {
      setTestResult({ type: "error", text: "An error occurred" })
    } finally {
      setSendingTest(false)
    }
  }

  if (!user || user.role !== "workspace_admin") {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab="workspace" userName={user?.name} />

      <main className="container mx-auto p-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Workspace Administration</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Create New Building
              </CardTitle>
            </CardHeader>
            <CardContent>
              {message.text && (
                <div
                  className={`p-4 mb-4 rounded flex items-center gap-2 ${
                    message.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {message.type === "error" ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                  {message.text}
                </div>
              )}

              <form onSubmit={handleCreateBuilding} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Building Name</label>
                  <Input
                    value={newBuilding}
                    onChange={(e) => setNewBuilding(e.target.value)}
                    placeholder="e.g. Schroeder"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Admin Email</label>
                  <Input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="Admin email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Admin Name</label>
                  <Input
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Admin name"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Building"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Test Email Functionality
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResult.text && (
                <div
                  className={`p-4 mb-4 rounded flex items-center gap-2 ${
                    testResult.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {testResult.type === "error" ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                  {testResult.text}
                </div>
              )}

              <form onSubmit={handleSendTestEmail} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipient Email</label>
                  <Input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Test recipient email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={testSubject}
                    onChange={(e) => setTestSubject(e.target.value)}
                    placeholder="Email subject"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <textarea
                    value={testContent}
                    onChange={(e) => setTestContent(e.target.value)}
                    placeholder="Email content"
                    required
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                  />
                </div>

                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700" disabled={sendingTest}>
                  {sendingTest ? "Sending..." : "Send Test Email"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

