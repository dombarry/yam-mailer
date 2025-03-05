import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"

type NameNotOnListDialogProps = {
  open: boolean
  onClose: () => void
  onSearchCampusWide: () => void
  onReportToFM: () => void
  name: string
}

const NameNotOnListDialog = ({ open, onClose, onSearchCampusWide, onReportToFM, name }: NameNotOnListDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-100 max-w-md">
        <DialogHeader>
          <DialogTitle>Name not on list...</DialogTitle>
          <DialogDescription>
            {name ? `"${name}"` : "This name"} is not a student in this hall, but packages can still be handled.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm">Click this button to search campus-wide for the student</p>
            <Button variant="outline" onClick={onSearchCampusWide} className="w-full">
              Search Campus-Wide
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm">Click this button to report the package to the facilities manager</p>
            <Button variant="outline" onClick={onReportToFM} className="w-full">
              Report to FM
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NameNotOnListDialog

