"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" // Changed from next/router to next/navigation
import LoginForm from "@/components/LoginForm"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import YamLogo from "@/components/YamLogo"

export default function Login() {
  const router = useRouter()
  const [loginType, setLoginType] = useState<"select" | "admin" | "dr">("select")

  if (loginType === "select") {
    return (
      <div className="min-h-screen bg-amber-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-center">
              <YamLogo />
            </div>
            <p className="text-center text-gray-600">
              MU Mailroom app portal.
              <br />
              Issues? Contact your FM.
            </p>
            <div className="space-y-4">
              <Button onClick={() => setLoginType("dr")} className="w-full" variant="outline">
                DR Login
              </Button>
              <Button onClick={() => setLoginType("admin")} className="w-full" variant="outline">
                Admin Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-600 flex items-center justify-center p-4">
      <LoginForm type={loginType} />
    </div>
  )
}

