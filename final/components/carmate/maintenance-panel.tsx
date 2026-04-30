"use client"

import { MapPinIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  parts,
  type Part,
  type PartKey,
  type Status,
} from "@/lib/carmate-data"
import { cn } from "@/lib/utils"
import { useMockBackend } from "./mock-backend"
import { InfoRow, progressClasses, StatusBadge } from "./shared"

type MaintenancePanelProps = {
  selectedPart: Part
  onSelectPart: (part: PartKey) => void
  onShop: () => void
}

export function MaintenancePanel({
  selectedPart,
  onSelectPart,
  onShop,
}: MaintenancePanelProps) {
  const {
    maintenanceTasks,
    completeMaintenanceTask,
    rescheduleMaintenanceTask,
  } = useMockBackend()
  const groups = [
    {
      title: "Completed",
      status: "done" as Status,
      items: maintenanceTasks.filter((task) => task.status === "done"),
    },
    {
      title: "Due now",
      status: "urgent" as Status,
      items: maintenanceTasks.filter((task) => task.status === "urgent"),
    },
    {
      title: "Upcoming",
      status: "soon" as Status,
      items: maintenanceTasks.filter((task) => task.status === "soon"),
    },
  ]

  function completeTask(taskId: string) {
    completeMaintenanceTask(taskId)
    toast.success("Task completed and added to service history")
  }

  function rescheduleTask(taskId: string) {
    rescheduleMaintenanceTask(taskId)
    toast.success("Task moved to upcoming")
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-3">
        {groups.map((group) => (
          <section key={group.title} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{group.title}</h2>
              <StatusBadge status={group.status} label={String(group.items.length)} />
            </div>
            {group.items.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardAction>
                    <StatusBadge
                      status={item.status}
                      label={
                        item.status === "done"
                          ? "Done"
                          : item.status === "urgent"
                            ? "Due now"
                            : "Soon"
                      }
                    />
                  </CardAction>
                  <CardTitle>{item.name}</CardTitle>
                  <CardDescription>{item.detail}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={item.progress}
                    className={cn("h-2", progressClasses[item.status])}
                  />
                  {item.status !== "done" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => completeTask(item.id)}>
                        Mark complete
                      </Button>
                      {item.status === "urgent" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rescheduleTask(item.id)}
                        >
                          Reschedule
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {group.items.length === 0 && (
              <div className="rounded-lg border border-dashed bg-card p-4 text-sm text-muted-foreground">
                No items in this lane.
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">All part areas</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a component to review status, cost range, and recommended next step.
              </p>
            </div>
            <StatusBadge status={selectedPart.status} label={`Selected: ${selectedPart.name}`} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {parts.map((part) => (
              <button
                key={part.key}
                type="button"
                className={cn(
                  "rounded-lg border bg-background p-4 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selectedPart.key === part.key && "border-primary"
                )}
                onClick={() => onSelectPart(part.key)}
              >
                <div className="flex items-start justify-between gap-3">
                  <strong>{part.name}</strong>
                  <StatusBadge status={part.status} label={part.label} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{part.next}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <StatusBadge status={selectedPart.status} label={selectedPart.label} />
          <h2 className="mt-3 text-xl font-semibold">{selectedPart.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{selectedPart.summary}</p>
          <Separator className="my-4" />
          <InfoRow label="Suggested next step" value={selectedPart.next} />
          <InfoRow label="Estimated range" value={selectedPart.estimate} />
          <Progress
            value={selectedPart.progress}
            className={cn("mt-4 h-2", progressClasses[selectedPart.status])}
          />
          <Button className="mt-4 w-full" onClick={onShop}>
            <MapPinIcon data-icon="inline-start" />
            Find nearby shop
          </Button>
        </div>
      </div>
    </div>
  )
}
