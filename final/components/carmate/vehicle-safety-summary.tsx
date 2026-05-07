"use client"

import { useEffect, useState } from "react"
import {
  AlertTriangleIcon,
  type LucideIcon,
  MessageCircleWarningIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Vehicle } from "@/lib/carmate-data"
import {
  getVehicleSafetyInsights,
  type NhtsaComplaint,
  type NhtsaRecall,
  type VehicleSafetyInsights,
} from "@/lib/nhtsa"

type SafetyState =
  | { status: "loading"; data: null }
  | { status: "ready"; data: VehicleSafetyInsights }
  | { status: "error"; data: null }

export function VehicleSafetySummary({ vehicle }: { vehicle: Vehicle }) {
  const [detailType, setDetailType] = useState<"recalls" | "complaints" | null>(
    null
  )
  const [state, setState] = useState<SafetyState>({
    status: "loading",
    data: null,
  })

  useEffect(() => {
    const controller = new AbortController()

    getVehicleSafetyInsights(vehicle, controller.signal)
      .then((data) => {
        setState({ status: "ready", data })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }

        setState({ status: "error", data: null })
      })

    return () => controller.abort()
  }, [vehicle.year, vehicle.make, vehicle.model, vehicle])

  if (state.status === "loading") {
    return (
      <div className="mt-3 rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground">
        Loading safety data...
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <div className="mt-3 rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground">
        Safety data unavailable.
      </div>
    )
  }

  const { complaintCount, complaints, matchedModel, overallRating, recallCount, recalls } =
    state.data

  return (
    <>
      <div className="mt-3 rounded-md border bg-muted/40 p-2.5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Safety
          </span>
          <Badge variant="outline" className="rounded-md">
            NHTSA
          </Badge>
        </div>
        <div className="grid gap-1.5 text-xs">
          <SafetyMetric
            icon={ShieldCheckIcon}
            label="Rating"
            value={overallRating ? `${overallRating}/5` : "N/A"}
          />
          <SafetyMetric
            icon={AlertTriangleIcon}
            label="Recalls"
            value={formatCount(recallCount)}
            onClick={() => setDetailType("recalls")}
          />
          <SafetyMetric
            icon={MessageCircleWarningIcon}
            label="Complaints"
            value={formatCount(complaintCount)}
            onClick={() => setDetailType("complaints")}
          />
        </div>
      </div>

      <Sheet open={detailType !== null} onOpenChange={(open) => !open && setDetailType(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              {detailType === "complaints" ? "NHTSA complaints" : "NHTSA recalls"}
            </SheetTitle>
            <SheetDescription>
              {vehicle.year} {vehicle.make} {matchedModel} official safety data.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1 px-4">
            {detailType === "complaints" ? (
              <ComplaintDetails complaints={complaints} />
            ) : (
              <RecallDetails recalls={recalls} />
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}

function SafetyMetric({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: LucideIcon
  label: string
  value: string
  onClick?: () => void
}) {
  if (onClick) {
    return (
      <Button
        type="button"
        variant="ghost"
        className="h-auto justify-between rounded-md bg-background px-2 py-1.5 text-left"
        onClick={onClick}
      >
        <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
          <Icon className="size-3.5 shrink-0" />
          <span className="truncate text-xs">{label}</span>
        </span>
        <strong className="text-sm leading-none">{value}</strong>
      </Button>
    )
  }

  return (
    <div className="flex min-w-0 items-center justify-between gap-2 rounded-md bg-background px-2 py-1.5">
      <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate text-xs">{label}</span>
      </div>
      <strong className="text-sm leading-none">{value}</strong>
    </div>
  )
}

function formatCount(value: number | null) {
  if (value === null) {
    return "N/A"
  }

  return String(value)
}

function RecallDetails({ recalls }: { recalls: NhtsaRecall[] }) {
  if (recalls.length === 0) {
    return <EmptySafetyMessage message="No recall records were returned." />
  }

  return (
    <div className="grid gap-3 pb-4">
      {recalls.map((recall, index) => (
        <article key={`${recall.NHTSACampaignNumber}-${index}`} className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-medium">{recall.Component ?? "Recall"}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Campaign {recall.NHTSACampaignNumber ?? "N/A"} · Reported{" "}
                {recall.ReportReceivedDate ?? "N/A"}
              </p>
            </div>
            {recall.NHTSAActionNumber && (
              <Badge variant="secondary" className="rounded-md">
                {recall.NHTSAActionNumber}
              </Badge>
            )}
          </div>
          <DetailBlock label="Summary" value={recall.Summary} />
          <DetailBlock label="Consequence" value={recall.Consequence} />
          <DetailBlock label="Remedy" value={recall.Remedy} />
        </article>
      ))}
    </div>
  )
}

function ComplaintDetails({ complaints }: { complaints: NhtsaComplaint[] }) {
  if (complaints.length === 0) {
    return <EmptySafetyMessage message="No complaint records were returned." />
  }

  return (
    <div className="grid gap-3 pb-4">
      {complaints.map((complaint, index) => (
        <article key={`${complaint.odiNumber}-${index}`} className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-medium">{complaint.components ?? "Complaint"}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                ODI {complaint.odiNumber ?? "N/A"} · Filed{" "}
                {complaint.dateComplaintFiled ?? "N/A"}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {complaint.crash && <Badge variant="destructive">Crash</Badge>}
              {complaint.fire && <Badge variant="destructive">Fire</Badge>}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <DetailPill label="Injuries" value={complaint.numberOfInjuries} />
            <DetailPill label="Deaths" value={complaint.numberOfDeaths} />
          </div>
          <DetailBlock label="Summary" value={complaint.summary} />
        </article>
      ))}
    </div>
  )
}

function DetailBlock({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return null
  }

  return (
    <div className="mt-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm leading-relaxed">{formatNhtsaText(value)}</p>
    </div>
  )
}

function DetailPill({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-md bg-muted px-2 py-1">
      <span className="text-muted-foreground">{label}</span>
      <strong className="ml-2">{value ?? 0}</strong>
    </div>
  )
}

function EmptySafetyMessage({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed bg-card p-4 text-sm text-muted-foreground">
      {message}
    </div>
  )
}

function formatNhtsaText(value: string) {
  const text = value.trim().replace(/\s+/g, " ")

  if (!isMostlyUppercase(text)) {
    return text
  }

  return text
    .toLocaleLowerCase("en-US")
    .replace(/(^|[.!?]\s+|:\s+)([a-z])/g, (match) => match.toLocaleUpperCase("en-US"))
    .replace(/\b(nhtsa|ferrari|vin|tty|http|https|usa)\b/gi, (match) =>
      match.toLocaleUpperCase("en-US")
    )
    .replace(/\bF458\b/gi, "F458")
    .replace(/\b458 Italia\b/gi, "458 Italia")
}

function isMostlyUppercase(value: string) {
  const letters = value.replace(/[^a-z]/gi, "")

  if (letters.length < 20) {
    return false
  }

  const uppercaseLetters = letters.replace(/[^A-Z]/g, "")

  return uppercaseLetters.length / letters.length > 0.8
}
