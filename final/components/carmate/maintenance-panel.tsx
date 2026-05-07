"use client"

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
import { type Status } from "@/lib/carmate-data"
import { cn } from "@/lib/utils"
import { useMockBackend } from "./mock-backend"
import { progressClasses, StatusBadge } from "./shared"

export function MaintenancePanel() {
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
    </div>
  )
}
