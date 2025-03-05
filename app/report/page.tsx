"use client"
import type { DashboardLogged, Hall, HallStats } from "@/lib/types"
import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import client components with SSR disabled
const ReportContent = dynamic(() => import("@/components/ReportContent"), { ssr: false })

const lower = (s: string): Hall => {
  switch (s) {
    case "Cobeen":
      return "cobeen"
    case "Mashuda":
      return "mashuda"
    case "Carpenter":
      return "carpenter"
    default:
      throw new Error("Invalid hall")
  }
}

const YEAR = "2024"
const startDate = new Date(`${YEAR}-08-01`)
const endDate = new Date(`${YEAR}-12-31`)

const restrictCombinedData = (data: HallStats[]): HallStats[] => {
  return data.map((d) => {
    return {
      hall: d.hall,
      packages: d.packages.filter((pkg) => {
        const date = new Date(pkg.ingestedTime)
        if (pkg.hasOwnProperty("retrievedTime")) {
          const newpkg = pkg as DashboardLogged
          const retrievedDate = new Date(newpkg.retrievedTime)
          return date >= startDate && date <= endDate && retrievedDate >= startDate && retrievedDate <= endDate
        } else {
          return date >= startDate && date <= endDate
        }
      }),
    }
  })
}

const restrictToInterval = (data: DashboardLogged[], interval: string): DashboardLogged[] => {
  return data.filter((d) => {
    const date = new Date(d.ingestedTime)
    return date >= startDate && date <= endDate
  })
}

type ProviderData = {
  provider: string
}

const filterDataToProviderOnly = (data: DashboardLogged[]): ProviderData[] => {
  const providers = new Map<string, number>()
  data.forEach((d) => {
    if (providers.has(d.provider)) {
      providers.set(d.provider, providers.get(d.provider)! + 1)
    } else {
      providers.set(d.provider, 1)
    }
  })
  const providerArray: ProviderData[] = []
  providers.forEach((value, key) => {
    providerArray.push({
      provider: key,
    })
  })
  return providerArray
}

const HALL = "Cobeen"

const cardCn = "h-[78vh] overflow-auto"
const INTERVAL = `Fall ${YEAR}`

const getNumStudents = (data: DashboardLogged[]): number => {
  const students = new Set<string>()
  data.forEach((d) => {
    students.add(d.studentId)
  })
  return students.size
}

const getNumDailyAvgPkgs = (data: DashboardLogged[]): number => {
  const days = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
  return data.length / days
}

const getMedianTimeToPickup = (data: DashboardLogged[]): number => {
  const times = data.map((d) => {
    const ingested = new Date(d.ingestedTime)
    const retrieved = new Date(d.retrievedTime)
    const diff = retrieved.getTime() - ingested.getTime()
    // calculate in hours
    return diff / (1000 * 3600)
  })
  times.sort((a, b) => a - b)
  const medianIndex = Math.floor(times.length / 2)
  return times[medianIndex]
}

export default function Report() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <ReportContent />
    </Suspense>
  )
}

