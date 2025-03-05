"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button, CircularProgress } from "@mui/material"
import { read, utils } from "xlsx"
import Popup from "@/components/Popup"
import type { SafeRoster } from "@/lib/types"
import { jsonHasDesired } from "@/lib/utility"
import { resetPass } from "@/lib/adminUtils"
import Header from "@/components/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import UserManagement from "@/components/UserManagement"
import type { JwtPayload } from "@/lib/jwt"
import InviteUsers from "./InviteUsers"

const desiredColumns = ["Last_Name", "First_Name", "University_ID", "Default_Email"]

export default function AdminContent() {
  const COBEEN_HOME = "cobeen-home"
  const COBEEN_ADMIN = "cobeen-admin"
  const KEY = "cobeen-admin"
  const COBEEN = "cobeen"

  const [homePassOpen, setHomePassOpen] = useState(false)
  const [adminPassOpen, setAdminPassOpen] = useState(false)
  const [homePass, setHomePass] = useState("")
  const [adminPass, setAdminPass] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [rosterOpen, setRosterOpen] = useState(false)
  const [roster, setRoster] = useState<SafeRoster[] | null>(null)
  const [user, setUser] = useState<JwtPayload | null>(null)

  useEffect(() => {
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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files) {
        // parse excel file to json using xlsx
        const data = await e.target.files[0].arrayBuffer()
        const workbook = read(data, { type: "buffer" })

        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const sheetJson: Record<string, any>[] = utils.sheet_to_json(sheet)

        sheetJson.every((row) => {
          if (!jsonHasDesired(row, desiredColumns)) {
            throw new Error("Invalid roster")
          }
        })

        const loadedRoster: SafeRoster[] = sheetJson.map((row) => {
          if (row.University_ID !== undefined) {
            return {
              Last_Name: row.Last_Name,
              First_Name: row.First_Name,
              University_ID: row.University_ID,
              Default_Email: row.Default_Email,
            }
          }
        }) as SafeRoster[]

        setRoster(loadedRoster)
      }
    } catch (err) {
      alert("Roster is missing desired columns")
    }
  }

  const uploadFile = async () => {
    if (!roster) {
      alert("No roster to upload")
      return
    }
    // send roster over to upload-roster
    const res = await fetch("/api/upload-roster", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roster: roster,
      }),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab="access" userName={user?.name} userRole={user?.role} />

      <main className="container mx-auto p-4 max-w-5xl">
        <Tabs defaultValue="passwords" className="w-full">
          <TabsList>
            <TabsTrigger value="passwords">Password Reset</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="invites">Invite Users</TabsTrigger>
            <TabsTrigger value="access-log">Access Log</TabsTrigger>
          </TabsList>

          <TabsContent value="passwords">
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>DR Password Reset</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      type="password"
                      value={homePass}
                      onChange={(e) => setHomePass(e.target.value)}
                      placeholder="New DR password"
                    />
                    <Button
                      className="w-full bg-amber-600 text-white"
                      onClick={() => resetPass(homePass, setHomePassOpen, COBEEN_HOME, setHomePass, setIsLoading)}
                    >
                      Reset DR Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Admin Password Reset</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      type="password"
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      placeholder="New admin password"
                    />
                    <Button
                      className="w-full bg-amber-600 text-white"
                      onClick={() => resetPass(adminPass, setAdminPassOpen, COBEEN_ADMIN, setAdminPass, setIsLoading)}
                    >
                      Reset Admin Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Button className="bg-amber-600 text-white" onClick={() => setRosterOpen(true)}>
                Import Roster
              </Button>
            </div>

            <Popup open={rosterOpen} handleClose={() => setRosterOpen(false)} title="Load Roster">
              <div className="h-full flex flex-col justify-between">
                <div className="flex flex-col justify-start items-start mb-[20vh]">
                  <p>Upload an .xlsx file to replace the current Cobeen roster</p>
                  <p>
                    NOTE: Row 1 MUST be the columns, and rows 2 through n are data entries. Please trim related details
                    before uploading.
                  </p>
                  <p>
                    Expected columns (must match exactly, and all additional columns are automatically removed by the
                    system):
                  </p>
                  <p>{desiredColumns.toString()}</p>
                </div>
                {isLoading ? (
                  <CircularProgress />
                ) : (
                  <div className="flex flex-row">
                    <input type="file" accept=".xlsx" onChange={handleFile} />
                    <button disabled={!roster} onClick={uploadFile}>
                      Upload
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          <TabsContent value="invites">
            <InviteUsers />
          </TabsContent>
          <TabsContent value="access-log">
            <Card>
              <CardHeader>
                <CardTitle>Access Log</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Access log will be displayed here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

