import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  icon: LucideIcon
  status?: "success" | "warning" | "error"
  statusText?: string
  sparklineData?: number[]
  className?: string
}

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  status,
  statusText,
  sparklineData,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-slate-600 text-sm font-medium">{title}</div>
          <Icon className="h-5 w-5 text-slate-400" />
        </div>

        <div className="mb-3">
          <span className="text-3xl font-bold text-slate-900 font-mono">
            {value}
          </span>
          {unit && (
            <span className="text-lg text-slate-500 ml-1">{unit}</span>
          )}
        </div>

        {status && statusText && (
          <Badge variant={status} className="mb-3">
            {statusText}
          </Badge>
        )}

        {sparklineData && sparklineData.length > 0 && (
          <div className="h-8 flex items-end space-x-1">
            {sparklineData.map((value, index) => (
              <div
                key={index}
                className="flex-1 bg-primary/30 rounded-t"
                style={{
                  height: `${(value / Math.max(...sparklineData)) * 100}%`,
                  minHeight: "4px",
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
