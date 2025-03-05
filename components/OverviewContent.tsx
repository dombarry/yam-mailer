"use client"

import type { Hall, HallLogged, HallStats } from "@/lib/types"
import { combineData, getAllLoggedPackages, getAllPackages } from "@/lib/adminUtils"
import { useEffect, useState } from "react"

import ByDistributor from "@/components/ByDistributor"
import { CircularProgress } from "@mui/material"
import Statistics from "@/components/Statistics"
import TimeToPickup from "@/components/TimeToPickup"
import Total from "@/components/Total"
import Header from "@/components/Header"
import type { JwtPayload } from "@/lib/jwt"

const halls: Hall[] = ["cobeen", "mashuda", "carpenter"]

export default function OverviewContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<HallStats[] | null>(null)
  const [loggedData, setLoggedData] = useState<HallLogged[] | null>(null)
  const [user, setUser] = useState<JwtPayload | null>(null)

  useEffect(() => {
    setIsLoading(true)
    getAllPackages(halls).then((data) => {
      setData(data)
    })
    getAllLoggedPackages(halls).then((data) => {
      setLoggedData(data)
    })
    setIsLoading(false)

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
      <Header activeTab="roster" userName={user?.name} />

      <div className="flex flex-col min-h-screen min-w-[90vw] ml px-[5vw]">
        {isLoading || data === null || loggedData === null ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : (
          <div className="flex flex-col justify-start my-10">
            <Statistics data={data} loggedData={loggedData} halls={halls} yearly={false} />
            <Statistics data={data} loggedData={loggedData} halls={halls} yearly={true} />
            <hr className="my-[5vh]" />
            <Total data={combineData(data, loggedData)} halls={halls} />
            <TimeToPickup data={data} loggedData={loggedData} halls={halls} />
            <ByDistributor data={combineData(data, loggedData)} halls={halls} />
          </div>
        )}
      </div>
    </div>
  )
}

