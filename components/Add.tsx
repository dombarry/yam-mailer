"use client"

import type { AcProps, Package, PackageNoIds, Student } from "@/lib/types"
import { Alert, Box, CircularProgress, Collapse } from "@mui/material"
import { useState, useEffect } from "react"

import AutocompleteWithDb from "@/components/AutocompleteWithDb"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import NameNotOnListDialog from "./NameNotOnListDialog"
import type { JwtPayload } from "@/lib/jwt"

const Add = () => {
  const [addingPackage, setAddingPackage] = useState(false)
  const [addedPackage, setAddedPackage] = useState<null | Package>(null)
  const [carrier, setCarrier] = useState<string | null>(null)
  const [record, setRecord] = useState<Record<string, any> | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [noName, setNoName] = useState(false)
  const [nameInput, setNameInput] = useState("")
  const [user, setUser] = useState<JwtPayload | null>(null)

  useEffect(() => {
    // Fetch user data to get the building
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

  const failPackage = async (pkg: Package) => {
    // cleanup
    setAddingPackage(false)
    setAddedPackage(pkg)
    setRecord(null)

    // send off to DB
    const res = await fetch("/api/fail-package", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pkg),
    })
  }

  const addPackage = async (obj: Student | null) => {
    if (obj === null || carrier === null) {
      alert("Please select a student")
    } else {
      setAddingPackage(true)

      console.log(obj)

      const pkg: PackageNoIds = {
        First: obj.First_Name,
        Last: obj.Last_Name,
        Email: obj.Default_Email,
        provider: carrier,
        studentId: obj.University_ID,
        building: user?.building || "cobeen", // Use the user's building or default to cobeen
      }

      const res = await fetch("/api/add-package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pkg),
      })

      console.log(res)

      if (res.status !== 200) {
        if (res.status === 501) {
          console.error("Unforseen error. Please contact Dominic Barry")
          console.error(await res.text())
        } else {
          console.log("entering failure recovery mode")
          failPackage(await res.json())
        }
      } else {
        const added_package: Package = await res.json()

        console.log("added pkg", added_package)

        setAddingPackage(false)
        setAddedPackage(added_package)
        setRecord(null)
        setCarrier(null)
      }
    }
  }

  const handleNoName = () => {
    setNoName(true)
  }

  const handleCarrierChange = (value: string) => {
    setCarrier(value)
  }

  const props: AcProps = {
    apiRoute: "get-students",
    acLabel: "Student",
    displayOption: (student: Student) => `${student.Last_Name}, ${student.First_Name}`,
    record: record,
    setRecord: setRecord,
    setLoaded,
  }

  const handleSubmit = () => {
    addPackage(record as Student)
  }

  const handleClose = () => {
    setNoName(false)
  }

  const handleSearchCampusWide = () => {
    // Implement campus-wide search functionality
    console.log("Searching campus-wide for:", nameInput)
    setNoName(false)
  }

  const handleReportToFM = () => {
    // Use the existing reportMissingName functionality
    if (nameInput) {
      fetch("/api/report-missing-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nameInput,
          building: user?.building || "cobeen", // Pass the building
        }),
      }).then((res) => {
        if (res.status === 200) {
          alert(
            "Please put the package in the designated bucket. An email has been sent to the facilities manager to alert them of the situation.",
          )
        } else {
          alert(
            "There was an error reporting the missing name via email. Please speak to the facilities manager directly.",
          )
        }
        setNoName(false)
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Register New Package</CardTitle>
      </CardHeader>
      <CardContent>
        {!addingPackage && (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Student Name</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <AutocompleteWithDb {...props} />
                  </div>
                  {loaded && record === null && (
                    <Button
                      variant="outline"
                      className="text-red-500 border-red-500 hover:bg-red-50"
                      onClick={() => {
                        setNameInput("")
                        handleNoName()
                      }}
                    >
                      Name Not On List
                    </Button>
                  )}
                </div>
              </div>

              {record !== null && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select the Package Carrier</label>
                  <Select onValueChange={handleCarrierChange} value={carrier || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Amazon">Amazon</SelectItem>
                      <SelectItem value="USPS">USPS</SelectItem>
                      <SelectItem value="UPS">UPS</SelectItem>
                      <SelectItem value="Fedex">Fedex</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {carrier !== null && (
                <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={handleSubmit}>
                  Add Package
                </Button>
              )}
            </div>
          </>
        )}

        <NameNotOnListDialog
          open={noName}
          onClose={handleClose}
          onSearchCampusWide={handleSearchCampusWide}
          onReportToFM={handleReportToFM}
          name={nameInput}
        />

        <Box
          sx={{
            width: "100%",
            position: "absolute",
            bottom: 0,
          }}
        >
          <Collapse in={addedPackage !== null}>
            <Alert onClose={() => setAddedPackage(null)}>
              Package added for {addedPackage?.Last}, {addedPackage?.First} with package number #
              {addedPackage?.packageId}. Write this on the box!
            </Alert>
          </Collapse>
        </Box>
        {addingPackage && (
          <div className="flex justify-center p-4">
            <CircularProgress />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default Add

