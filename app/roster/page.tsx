"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, HelpCircle } from "lucide-react"
import type { SafeRoster } from "@/lib/types"
import { read, utils } from "xlsx"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function RosterPage() {
  const [roster, setRoster] = useState<SafeRoster[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)

  const requiredColumns = ["Last_Name", "First_Name", "University_ID", "Default_Email"]

  useEffect(() => {
    fetchRoster()
    fetchUser()
  }, [])

  const fetchRoster = async () => {
    try {
      const response = await fetch("/api/get-roster")
      if (response.ok) {
        const data = await response.json()
        setRoster(data.records)
      }
    } catch (error) {
      console.error("Failed to fetch roster", error)
    }
  }

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files) {
        setIsLoading(true)
        const file = e.target.files[0]
        const data = await file.arrayBuffer()
        const workbook = read(data, { type: "buffer" })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = utils.sheet_to_json(sheet)

        // Validate columns
        const firstRow = jsonData[0] as Record<string, any>
        const hasAllColumns = requiredColumns.every((col) => col in firstRow)
        const hasOnlyRequiredColumns = Object.keys(firstRow).every((col) => requiredColumns.includes(col))

        if (!hasAllColumns || !hasOnlyRequiredColumns) {
          throw new Error(
            "Invalid column structure. Please ensure the file has exactly these columns: " + requiredColumns.join(", "),
          )
        }

        // Validate data format
        const validatedRoster = jsonData.map((row: any) => {
          // Ensure University_ID is a string and has correct format
          const universityId = row.University_ID.toString().padStart(9, "0")
          if (universityId.length !== 9) {
            throw new Error("University ID must be 9 digits")
          }

          // Ensure email format is correct
          if (!row.Default_Email.endsWith("@marquette.edu")) {
            throw new Error("Email must be a Marquette email address")
          }

          return {
            Last_Name: row.Last_Name,
            First_Name: row.First_Name,
            University_ID: universityId,
            Default_Email: row.Default_Email,
          }
        })

        // Upload roster
        const response = await fetch("/api/upload-roster", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roster: validatedRoster }),
        })

        if (response.ok) {
          await fetchRoster() // Refresh the roster display
        } else {
          throw new Error("Failed to upload roster")
        }
      }
    } catch (error) {
      alert("Error uploading roster: " + (error as Error).message)
    } finally {
      setIsLoading(false)
      // Clear the input
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab="roster" userName={user?.name} userRole={user?.role} />

      <main className="container mx-auto p-4 max-w-7xl">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Current Roster</h2>
              <div className="flex items-center gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px]">
                      <p>Upload an Excel file (.xlsx) with exactly these columns:</p>
                      <ul className="list-disc ml-4 mt-2">
                        <li>Last_Name</li>
                        <li>First_Name</li>
                        <li>University_ID (9 digits)</li>
                        <li>Default_Email (@marquette.edu)</li>
                      </ul>
                      <p className="mt-2">Example row:</p>
                      <p className="text-xs mt-1">Abu-Hatoum, Michael, 006284871, michael.abu-hatoum@marquette.edu</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  onClick={() => document.getElementById("rosterUpload")?.click()}
                  className="bg-amber-600 hover:bg-amber-700"
                  disabled={isLoading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Roster
                </Button>
                <input
                  id="rosterUpload"
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Last Name</th>
                    <th className="p-2 text-left">First Name</th>
                    <th className="p-2 text-left">University ID</th>
                    <th className="p-2 text-left">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((student, index) => (
                    <tr key={student.University_ID} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-2">{student.Last_Name}</td>
                      <td className="p-2">{student.First_Name}</td>
                      <td className="p-2">{student.University_ID}</td>
                      <td className="p-2">{student.Default_Email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

