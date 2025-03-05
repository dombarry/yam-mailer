import * as React from "react"
import type { ColumnDef, Row } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: Row<TData>[]
}

const DataTable = React.forwardRef<HTMLTableElement, DataTableProps<any>>(({ columns, data, ...props }, ref) => {
  return (
    <table
      ref={ref}
      className={cn("w-full min-w-[300px] border-collapse table-auto text-left", props.className)}
      {...props}
    >
      <thead>
        {columns.map((column) => (
          <th key={column.id} className="p-4 text-sm font-medium text-muted-foreground">
            {column.header}
          </th>
        ))}
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} className="border-t border-muted">
            {columns.map((column) => (
              <td key={column.id} className="p-4">
                {column.cell.render({ row })}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
})
DataTable.displayName = "DataTable"

export { DataTable }

