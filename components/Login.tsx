import type React from "react"
import { CircularProgress } from "@mui/material"
import Link from "next/link"
import axios from "axios"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import YamLogo from "./YamLogo"

interface Props {
  setIsLoggedIn: (value: boolean) => void
  pageKey: string
  admin: boolean
}

const Login = (props: Props): React.ReactElement => {
  const { setIsLoggedIn, pageKey } = props
  const [input, setInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const getHash = async (password: string) => {
    setIsLoading(true)
    setInput("")
    const { data, status } = await axios.post("/api/hash-pass", {
      params: {
        key: pageKey,
        password,
      },
    })

    if (status !== 200) {
      console.log(status)
      alert("Something went wrong")
      throw new Error("Error")
    } else {
      const result = data.result as boolean
      if (!result) {
        alert("Incorrect password")
      }
      setIsLoggedIn(result)
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-amber-600 text-white">
          <div className="flex justify-center mb-2">
            <YamLogo />
          </div>
          <CardTitle className="text-center">{props.admin ? "Admin Access" : "Mailroom Access"}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <CircularProgress />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter Access Code</label>
                <Input
                  type="password"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Access code"
                />
              </div>
              <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={() => getHash(input)}>
                Submit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-4">
        <Link href={props.admin ? "/" : "/admin"} className="text-amber-600 hover:text-amber-800">
          {props.admin ? "Go to Mailroom" : "Go to Admin"}
        </Link>
      </div>
    </div>
  )
}

export default Login

