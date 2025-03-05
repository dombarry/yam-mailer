"use client"

import type { Hall } from "@/lib/types"
import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import client components with SSR disabled
const OverviewContent = dynamic(() => import("@/components/OverviewContent"), { ssr: false })

const halls: Hall[] = ["cobeen", "mashuda", "carpenter"]

export default function Overview() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <OverviewContent />
    </Suspense>
  )
}

