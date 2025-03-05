import { Card, CardContent } from "./ui/card"

type MetricCardProps = {
  title: string
  value: number
}

const MetricCard = ({ title, value }: MetricCardProps) => {
  return (
    <Card className="flex-1">
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className="p-4 border-r flex-1">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="font-semibold">Packages</p>
          </div>
          <div className="p-4 flex-1 flex justify-center">
            <span className="text-3xl font-bold">{value}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default MetricCard

