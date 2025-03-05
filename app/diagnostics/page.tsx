"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell } from "recharts"
import type { Package, LogPackage } from "@/lib/types"

type CarrierData = {
  name: string
  value: number
}

type FrequentUser = {
  name: string
  count: number
}

type AgingPackage = {
  id: string
  days: number
  recipient: string
}

export default function DiagnosticsPage() {
  const [carrierData, setCarrierData] = useState<CarrierData[]>([])
  const [frequentUsers, setFrequentUsers] = useState<FrequentUser[]>([])
  const [agingPackages, setAgingPackages] = useState<AgingPackage[]>([])
  const [user, setUser] = useState(null)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  useEffect(() => {
    fetchData()
    fetchUser()
  }, [])

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

  const fetchData = async () => {
    try {
      const [packagesRes, loggedRes] = await Promise.all([
        fetch("/api/get-packages"),
        fetch("/api/get-logged-packages"),
      ])

      const packages: Package[] = (await packagesRes.json()).records
      const loggedPackages: LogPackage[] = (await loggedRes.json()).records

      // Process carrier data
      const carrierCounts = new Map<string, number>()
      packages.forEach((pkg) => {
        carrierCounts.set(pkg.provider, (carrierCounts.get(pkg.provider) || 0) + 1)
      })

      setCarrierData(Array.from(carrierCounts.entries()).map(([name, value]) => ({ name, value })))

      // Process frequent users
      const userCounts = new Map<string, number>()
      loggedPackages.forEach((pkg) => {
        const name = `${pkg.First} ${pkg.Last}`
        userCounts.set(name, (userCounts.get(name) || 0) + 1)
      })

      setFrequentUsers(
        Array.from(userCounts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
      )

      // Process aging packages
      const now = new Date()
      const aging = packages
        .map((pkg) => {
          const ingestedDate = new Date(pkg._id.toString().substring(0, 8))
          const days = Math.floor((now.getTime() - ingestedDate.getTime()) / (1000 * 60 * 60 * 24))
          return {
            id: pkg.packageId.toString(),
            days,
            recipient: `${pkg.First} ${pkg.Last}`,
          }
        })
        .filter((pkg) => pkg.days > 7)
        .sort((a, b) => b.days - a.days)

      setAgingPackages(aging)
    } catch (error) {
      console.error("Failed to fetch diagnostic data", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab="diagnostics" userName={user?.name} userRole={user?.role} />

      <main className="container mx-auto p-4 max-w-7xl">
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Frequent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {frequentUsers.map((user, index) => (
                  <div key={user.name} className="flex justify-between items-center">
                    <span>{user.name}</span>
                    <span className="font-medium">{user.count} packages</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Carrier Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <PieChart width={300} height={300}>
                <Pie
                  data={carrierData}
                  cx={150}
                  cy={150}
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {carrierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Aging Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {agingPackages.map((pkg) => (
                  <div key={pkg.id} className="flex justify-between items-center">
                    <span>{pkg.recipient}</span>
                    <span className="font-medium">{pkg.days} days old</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

