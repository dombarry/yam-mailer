"use client"
import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import client components with SSR disabled
const DashboardContent = dynamic(() => import("@/components/DashboardContent"), { ssr: false })

const getNumPackages = async (): Promise<number> => {
  const res = await fetch("/api/get-packages")
  const data = await res.json()
  return data.records.length
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}

