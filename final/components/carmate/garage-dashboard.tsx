"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import {
  ClipboardListIcon,
  MessageSquareTextIcon,
  PackageSearchIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"

import { VehicleStage } from "@/components/carmate/vehicle-stage"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  getPart,
  type PartKey,
} from "@/lib/carmate-data"
import { useMockBackend } from "./mock-backend"
import { InfoRow, StatusBadge } from "./shared"
import { VehicleDialog } from "./vehicle-dialog"

export function GarageDashboard() {
  const router = useRouter()
  const [selectedPart, setSelectedPart] = useState<PartKey>("engine")
  const [vehicleOpen, setVehicleOpen] = useState(false)
  const {
    vehicle,
    maintenanceTasks,
    serviceRecords,
    remindersEnabled,
    setRemindersEnabled,
  } = useMockBackend()
  const activePart = useMemo(() => getPart(selectedPart), [selectedPart])
  const dueNow = maintenanceTasks.filter((task) => task.status === "urgent").length
  const upcoming = maintenanceTasks.filter((task) => task.status === "soon").length
  const healthy = maintenanceTasks.filter((task) => task.status === "healthy").length

  function selectPart(part: PartKey) {
    setSelectedPart(part)
    toast.info(`${getPart(part).name} selected`)
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <StatusBadge status="urgent" label={`${dueNow} items due now`} />
              <h1 className="mt-3 text-3xl font-semibold tracking-normal md:text-5xl">
                {vehicle.trim}
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Monitor inspections, maintenance planning, and service records from one
                workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/diagnose">
                  <MessageSquareTextIcon data-icon="inline-start" />
                  Diagnose issue
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setVehicleOpen(true)}>
                Edit vehicle
              </Button>
            </div>
          </div>

          <VehicleStage
            activePart={activePart}
            selectedPart={selectedPart}
            onSelectPart={selectPart}
            onViewPlan={() => {
              window.localStorage.setItem("carmate:selected-part", activePart.key)
              router.push("/parts#service-plan")
            }}
          />
        </div>

        <aside className="grid content-start gap-4">
          <Card data-tour-step-id="garage-status">
            <CardHeader>
              <CardTitle>Garage status</CardTitle>
              <CardDescription>Current maintenance signals and quick actions.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <InfoRow label="Due now" value={`${dueNow} maintenance items`} />
              <InfoRow label="Upcoming" value={`${upcoming} planned items`} />
              <InfoRow label="Healthy" value={`${healthy} tracked areas`} />
              <InfoRow label="Records" value={`${serviceRecords.length} saved visits`} />
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">Maintenance reminders</span>
                <Switch
                  checked={remindersEnabled}
                  onCheckedChange={setRemindersEnabled}
                  aria-label="Maintenance reminders"
                />
              </div>
              <Button asChild variant="outline">
                <Link href="/maintenance">
                  <WrenchIcon data-icon="inline-start" />
                  Review schedule
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" data-tour-step-id="main-actions">
        <ActionCard
          href="/diagnose"
          icon={MessageSquareTextIcon}
          title="Find likely issue"
          detail="Use codes, symptoms, and custom notes to produce a likely starting point."
        />
        <ActionCard
          href="/maintenance"
          icon={WrenchIcon}
          title="Review schedule"
          detail="See completed, due-now, and upcoming work in separate lanes."
        />
        <ActionCard
          href="/parts"
          icon={PackageSearchIcon}
          title="Inspect parts"
          detail="Browse component-level status, estimates, and next steps."
        />
        <ActionCard
          href="/records"
          icon={ClipboardListIcon}
          title="Share records"
          detail="Prepare service history for a mechanic, resale, or personal records."
        />
      </section>
      <VehicleDialog open={vehicleOpen} onOpenChange={setVehicleOpen} />
    </div>
  )
}

function ActionCard({
  href,
  icon: Icon,
  title,
  detail,
}: {
  href: string
  icon: LucideIcon
  title: string
  detail: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardAction>
          <Icon className="size-5 text-muted-foreground" />
        </CardAction>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{detail}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={href}>Open</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
