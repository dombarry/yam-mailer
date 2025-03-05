import { Button } from "@mui/material"
import type { ReactElement } from "react"

const handleGoBack = () => {
  window.history.back()
}

const GoBack = (): ReactElement => {
  return <Button onClick={handleGoBack}>Go back</Button>
}

export default GoBack

