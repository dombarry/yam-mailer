"use client"

import type { AcProps, LogPackage, Package, Student } from "@/lib/types"
import { Alert, Box, CircularProgress, Collapse } from "@mui/material"
import { useEffect, useState } from "react"

import AutocompleteWithDb from "@/components/AutocompleteWithDb"
import type { ObjectId } from "mongodb"
import type { PackageData } from "@/pages/api/get-packages"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Checkbox } from "@mui/material"

const removeAndLogPackage = async (obj: Package | null) => {
  if (obj === null) {
    alert("No package selected")
    throw new Error("No package selected")
  }
  try {
    console.log("obj", obj)
    const _id: ObjectId = obj._id
    // remove package from db
    const res: Response = await fetch("/api/remove-package", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_id),
    })

    const success: boolean = await res.json()

    if (!success) {
      console.log("failed to remove package")
      throw new Error("Package not removed")
    }

    // log package to logs db
    const log_res = await fetch("/api/log-package", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    })

    const log_package: LogPackage = await log_res.json()

    // alert(`Package retrieved for ${log_package.Last}, ${log_package.First} with ID (${log_package.packageId})`)
  } catch (error) {
    alert("An error has occured. Please speak to the facilities manager")
  }
}

const Retrieve = () => {
  const [student, setStudent] = useState<Student | null>(null)
  const [packages, setPackages] = useState<Package[] | null>(null)
  const [retrievedPackages, setRetrievedPackages] = useState<Package[] | null>(null)
  const [retrievingPackages, setRetrievingPackages] = useState(false)
  const [findingPackages, setFindingPackages] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const [checkedItems, setCheckedItems] = useState({})
  useEffect(() => {
    if (packages !== null) {
      setCheckedItems(Object.fromEntries(packages.map((item) => [item.packageId, false])))
    }
  }, [packages])

  useEffect(() => {
    if (student === null) {
      setPackages(null)
    }
  }, [student])

  const handleCheck = (event, id) => {
    const updatedCheckedItems = {
      ...checkedItems,
      [id]: event.target.checked,
    }
    setCheckedItems(updatedCheckedItems)
  }

  const handlePickup = async () => {
    if (packages === null) {
      alert("No packages found for this student. If you're sure is a mistake, contact the facilities manager.")
      throw new Error("No packages found for this student")
    }
    const selectedPackages = packages.filter((pkg) => checkedItems[pkg.packageId])
    if (selectedPackages.length === 0) {
      alert("No packages selected")
    } else {
      setRetrievingPackages(true)
      for (const pkg of selectedPackages) {
        await removeAndLogPackage(pkg)
      }
      setRetrievedPackages(selectedPackages)
      setPackages(null)
      setStudent(null)
      setRetrievingPackages(false)
    }
  }

  const props: AcProps = {
    apiRoute: "get-students",
    acLabel: "Student ID",
    displayOption: (student: Student) => `${student.University_ID}`,
    record: student,
    setRecord: setStudent,
    setLoaded: setLoaded,
  }

  const handleIdClick = async () => {
    if (student === null) {
      alert("Please select a student")
    } else {
      setFindingPackages(true)
      const res = await fetch("/api/get-packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(student.University_ID),
      })

      const data = (await res.json()) as PackageData
      const packages = data.records
      // console.log('packages', packages)
      if (packages.length === 0) {
        alert("No packages found for this student")
      } else {
        setPackages(packages)
      }
      setFindingPackages(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Retrieve Packages</CardTitle>
      </CardHeader>
      <CardContent>
        {!retrievingPackages && (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Student ID Number</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <AutocompleteWithDb {...props} />
                  </div>
                  {loaded && (
                    <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleIdClick}>
                      Search
                    </Button>
                  )}
                </div>
              </div>

              {findingPackages && (
                <div className="flex justify-center p-4">
                  <CircularProgress />
                </div>
              )}

              {packages !== null && student !== null && (
                <div className="space-y-4 mt-4 border p-4 rounded-md">
                  <h3 className="font-medium">Choose package IDs to pick up</h3>
                  <div className="space-y-2">
                    {packages?.map((mailPackage: Package) => (
                      <div key={mailPackage.packageId} className="flex items-center space-x-2">
                        <Checkbox
                          checked={checkedItems[mailPackage.packageId]}
                          onChange={(event) => handleCheck(event, mailPackage.packageId)}
                          name={`${mailPackage.packageId.toString()} test`}
                        />
                        <label>{mailPackage.packageId.toString()}</label>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={handlePickup}>
                    Pick up selected packages
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        <Box
          sx={{
            width: "100%",
            position: "absolute",
            bottom: 0,
          }}
        >
          <Collapse in={retrievedPackages !== null}>
            <Alert onClose={() => setRetrievedPackages(null)}>
              {retrievedPackages?.length} package{retrievedPackages !== null && retrievedPackages.length > 1 ? "s" : ""}{" "}
              retrieved and logged. Make sure to they get handed off to the receiver!
            </Alert>
          </Collapse>
        </Box>
        {retrievingPackages && (
          <div className="flex justify-center p-4">
            <CircularProgress />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default Retrieve

