"use client"
import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import client components with SSR disabled
const AdminContent = dynamic(() => import("@/components/AdminContent"), { ssr: false })

const desiredColumns = ["Last_Name", "First_Name", "University_ID", "Default_Email"]

export default function Admin() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <AdminContent />
    </Suspense>
  )
}

