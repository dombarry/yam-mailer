"use client"

import { useEffect, useState } from "react"
import Add from "@/components/Add"
import Retrieve from "@/components/Retrieve"
import Header from "@/components/Header"
import MetricCard from "@/components/MetricCard"
import type { JwtPayload } from "@/lib/jwt"

const getNumPackages = async (): Promise<number> => {
  const res = await fetch("/api/get-packages")
  const data = await res.json()
  return data.records.length
}

const getTotalPackages = async (): Promise<number> => {
  const res = await fetch("/api/get-logged-packages")
  const data = await res.json()
  return data.records.length
}

export default function DashboardContent() {
  const [numPackages, setNumPackages] = useState<number>(0)
  const [totalPackages, setTotalPackages] = useState<number>(0)
  const [loaded, setLoaded] = useState<boolean>(false)
  const [user, setUser] = useState<JwtPayload | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const [current, total] = await Promise.all([getNumPackages(), getTotalPackages()])
      setNumPackages(current)
      setTotalPackages(total)
      setLoaded(true)
    }

    fetchData()

    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Failed to fetch user data", error)
      }
    }

    fetchUser()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab="dashboard" userName={user?.name} userRole={user?.role} />

      <main className="container mx-auto p-4 max-w-5xl">
        <div className="grid grid-cols-2 gap-4 mb-6 mt-4">
          <MetricCard title="Current Outstanding" value={numPackages} />
          <MetricCard title="Total Processed" value={totalPackages} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Add />
          </div>
          <div>
            <Retrieve />
          </div>
        </div>
      </main>
    </div>
  )
}

