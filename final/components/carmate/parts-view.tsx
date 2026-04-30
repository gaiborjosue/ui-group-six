"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  BookmarkCheckIcon,
  CalendarClockIcon,
  MapPinIcon,
  Trash2Icon,
  WrenchIcon,
} from "lucide-react"
import { toast } from "sonner"

import { VehicleStage } from "@/components/carmate/vehicle-stage"
import { ShopSheet } from "@/components/carmate/overlays"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getPart,
  parts,
  type PartKey,
} from "@/lib/carmate-data"
import { cn } from "@/lib/utils"
import { useMockBackend } from "./mock-backend"
import { InfoRow, progressClasses, StatusBadge } from "./shared"

export function PartsView() {
  const [selectedPart, setSelectedPart] = useState<PartKey>(getStoredPart)
  const [shopOpen, setShopOpen] = useState(false)
  const planRef = useRef<HTMLElement>(null)
  const { removeEstimate, saveEstimate, savedEstimates } = useMockBackend()
  const activePart = useMemo(() => getPart(selectedPart), [selectedPart])
  const activeEstimateSaved = savedEstimates.some(
    (estimate) => estimate.partKey === activePart.key
  )
  const inspectionQueue = useMemo(
    () =>
      [...parts].sort(
        (first, second) =>
          attentionRank[first.status] - attentionRank[second.status] ||
          second.progress - first.progress ||
          first.name.localeCompare(second.name)
      ),
    []
  )
  const savedPlan = useMemo(
    () =>
      savedEstimates
        .map((estimate) => ({
          ...estimate,
          part: getPart(estimate.partKey),
        }))
        .sort(
          (first, second) =>
            attentionRank[first.part.status] - attentionRank[second.part.status] ||
            first.part.name.localeCompare(second.part.name)
        ),
    [savedEstimates]
  )

  function selectPart(part: PartKey) {
    setSelectedPart(part)
    window.localStorage.setItem("carmate:selected-part", part)
    toast.info(`${getPart(part).name} selected`)
  }

  function viewPlan() {
    planRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function scheduleEstimate(part: PartKey) {
    selectPart(part)
    setShopOpen(true)
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase text-muted-foreground">Parts</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
            Interactive part inspection
          </h1>
          <p className="mt-3 text-muted-foreground">
            The car is the primary navigation surface here, with a persistent part inspector
            instead of a centered all-in-one dashboard.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/maintenance">
            <WrenchIcon data-icon="inline-start" />
            Open maintenance
          </Link>
        </Button>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <VehicleStage
          activePart={activePart}
          selectedPart={selectedPart}
          onSelectPart={selectPart}
          onViewPlan={viewPlan}
        />

        <aside className="rounded-lg border bg-card p-5">
          <StatusBadge status={activePart.status} label={activePart.label} />
          <h2 className="mt-3 text-2xl font-semibold">{activePart.name}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{activePart.summary}</p>
          <Separator className="my-4" />
          <InfoRow label="Suggested next step" value={activePart.next} />
          <InfoRow label="Estimated range" value={activePart.estimate} />
          <Progress
            value={activePart.progress}
            className={cn("mt-4 h-2", progressClasses[activePart.status])}
          />
          <div className="mt-4 grid gap-2">
            <Button onClick={() => setShopOpen(true)}>
              <MapPinIcon data-icon="inline-start" />
              Find nearby shop
            </Button>
            <Button
              variant="outline"
              disabled={activeEstimateSaved}
              onClick={() => {
                saveEstimate(activePart)
                toast.success("Estimate added to service plan")
              }}
            >
              <BookmarkCheckIcon data-icon="inline-start" />
              {activeEstimateSaved ? "Estimate in plan" : "Add estimate to plan"}
            </Button>
            <Button asChild variant="outline">
              <Link href="/records">Review service records</Link>
            </Button>
          </div>
          {savedEstimates.length > 0 && (
            <button
              type="button"
              className="mt-3 text-left text-xs text-muted-foreground underline-offset-4 hover:underline"
              onClick={viewPlan}
            >
              {savedEstimates.length} saved estimate{savedEstimates.length === 1 ? "" : "s"} in plan.
            </button>
          )}
        </aside>
      </section>

      <section className="rounded-lg border bg-card">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b p-4">
          <div>
            <h2 className="text-lg font-semibold">Inspection queue</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Compare all tracked areas and select a row to update the 3D view.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => selectPart("tires")}>
            Show highest priority
          </Button>
        </div>

        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-44">Attention</TableHead>
                <TableHead>Next step</TableHead>
                <TableHead className="text-right">Range</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inspectionQueue.map((part) => (
                <TableRow
                  key={part.key}
                  data-state={selectedPart === part.key ? "selected" : undefined}
                  className="cursor-pointer"
                  onClick={() => selectPart(part.key)}
                >
                  <TableCell className="font-medium">{part.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={part.status} label={part.label} />
                  </TableCell>
                  <TableCell>
                    <Progress
                      value={part.progress}
                      className={cn("h-2", progressClasses[part.status])}
                    />
                  </TableCell>
                  <TableCell className="max-w-xl whitespace-normal text-muted-foreground">
                    {part.next}
                  </TableCell>
                  <TableCell className="text-right font-medium">{part.estimate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="grid gap-2 p-3 md:hidden">
          {inspectionQueue.map((part) => (
            <button
              key={part.key}
              type="button"
              className={cn(
                "rounded-lg border bg-background p-3 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selectedPart === part.key && "border-primary"
              )}
              onClick={() => selectPart(part.key)}
            >
              <div className="flex items-start justify-between gap-3">
                <strong>{part.name}</strong>
                <StatusBadge status={part.status} label={part.label} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{part.next}</p>
              <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                <Progress
                  value={part.progress}
                  className={cn("h-2 flex-1", progressClasses[part.status])}
                />
                <span className="font-medium">{part.estimate}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section ref={planRef} id="service-plan" className="rounded-lg border bg-card">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b p-4">
          <div>
            <h2 className="text-lg font-semibold">Service plan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Saved estimates from the inspection view, ready to review or schedule.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => scheduleEstimate(selectedPart)}>
            <CalendarClockIcon data-icon="inline-start" />
            Schedule selected part
          </Button>
        </div>

        {savedPlan.length > 0 ? (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Saved</TableHead>
                    <TableHead className="text-right">Estimate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedPlan.map((estimate) => (
                    <TableRow key={estimate.id}>
                      <TableCell className="font-medium">{estimate.partName}</TableCell>
                      <TableCell>
                        <StatusBadge
                          status={estimate.part.status}
                          label={estimate.part.label}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {estimate.savedAt}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {estimate.estimate}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => selectPart(estimate.partKey)}
                          >
                            Select
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => scheduleEstimate(estimate.partKey)}
                          >
                            Schedule
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              removeEstimate(estimate.id)
                              toast.success("Estimate removed from plan")
                            }}
                          >
                            <Trash2Icon data-icon="inline-start" />
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-2 p-3 md:hidden">
              {savedPlan.map((estimate) => (
                <div key={estimate.id} className="rounded-lg border bg-background p-3">
                  <div className="flex items-start justify-between gap-3">
                    <strong>{estimate.partName}</strong>
                    <StatusBadge
                      status={estimate.part.status}
                      label={estimate.part.label}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">Estimate</span>
                    <span className="font-medium">{estimate.estimate}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">Saved</span>
                    <span>{estimate.savedAt}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectPart(estimate.partKey)}
                    >
                      Select
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scheduleEstimate(estimate.partKey)}
                    >
                      Schedule
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        removeEstimate(estimate.id)
                        toast.success("Estimate removed from plan")
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3 p-6 text-sm text-muted-foreground">
            <p>No estimates have been saved yet.</p>
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  saveEstimate(activePart)
                  toast.success("Estimate added to service plan")
                }}
              >
                <BookmarkCheckIcon data-icon="inline-start" />
                Add selected estimate
              </Button>
            </div>
          </div>
        )}
      </section>

      <ShopSheet open={shopOpen} onOpenChange={setShopOpen} part={activePart} />
    </div>
  )
}

const attentionRank = {
  urgent: 0,
  soon: 1,
  healthy: 2,
  done: 3,
}

function getStoredPart(): PartKey {
  if (typeof window === "undefined") {
    return "engine"
  }

  const stored = window.localStorage.getItem("carmate:selected-part")

  return isPartKey(stored) ? stored : "engine"
}

function isPartKey(value: string | null): value is PartKey {
  return (
    value === "engine" ||
    value === "battery" ||
    value === "brakes" ||
    value === "tires" ||
    value === "fluids" ||
    value === "lights" ||
    value === "body" ||
    value === "wipers"
  )
}
