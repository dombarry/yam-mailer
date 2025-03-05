"use client"
import YamLogo from "./YamLogo"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"

type HeaderProps = {
  activeTab?: "dashboard" | "access" | "roster" | "diagnostics" | "workspace"
  userName?: string
  userRole?: string
}

const Header = ({ activeTab = "dashboard", userName, userRole }: HeaderProps) => {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  return (
    <header className="bg-amber-600 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <YamLogo />

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Link
              href="/"
              className={`px-4 py-1 rounded-full text-sm ${
                activeTab === "dashboard" ? "bg-white text-amber-600" : "bg-amber-500 text-white hover:bg-amber-400"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin"
              className={`px-4 py-1 rounded-full text-sm ${
                activeTab === "access" ? "bg-white text-amber-600" : "bg-amber-500 text-white hover:bg-amber-400"
              }`}
            >
              Access
            </Link>
            <Link
              href="/roster"
              className={`px-4 py-1 rounded-full text-sm ${
                activeTab === "roster" ? "bg-white text-amber-600" : "bg-amber-500 text-white hover:bg-amber-400"
              }`}
            >
              Roster
            </Link>
            <Link
              href="/diagnostics"
              className={`px-4 py-1 rounded-full text-sm ${
                activeTab === "diagnostics" ? "bg-white text-amber-600" : "bg-amber-500 text-white hover:bg-amber-400"
              }`}
            >
              Diagnostics
            </Link>
            {userRole === "workspace_admin" && (
              <Link
                href="/workspace-admin"
                className={`px-4 py-1 rounded-full text-sm ${
                  activeTab === "workspace" ? "bg-white text-amber-600" : "bg-amber-500 text-white hover:bg-amber-400"
                }`}
              >
                Workspace
              </Link>
            )}
          </div>

          {userName && (
            <div className="flex items-center gap-2 text-white">
              <span className="text-sm hidden md:inline">{userName}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-amber-500">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

