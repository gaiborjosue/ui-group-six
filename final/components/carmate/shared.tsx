import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import type { Status } from "@/lib/carmate-data"
import { cn } from "@/lib/utils"

export const statusClasses: Record<Status, string> = {
  urgent: "border-destructive/20 bg-destructive/10 text-destructive",
  soon: "border-primary/20 bg-primary/10 text-primary",
  healthy: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
  done: "border-foreground/10 bg-secondary text-secondary-foreground",
}

export const progressClasses: Record<Status, string> = {
  urgent: "[&>div]:bg-destructive",
  soon: "[&>div]:bg-primary",
  healthy: "[&>div]:bg-emerald-600",
  done: "[&>div]:bg-foreground",
}

export function StatusBadge({ status, label }: { status: Status; label: string }) {
  return (
    <Badge variant="outline" className={cn("rounded-md", statusClasses[status])}>
      {label}
    </Badge>
  )
}

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <strong className="max-w-52 text-right text-sm font-medium">{value}</strong>
    </div>
  )
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon
  label: string
  value: string
  detail: string
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardAction>
          <Icon className="size-4 text-muted-foreground" />
        </CardAction>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}
