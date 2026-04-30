"use client"

import { useMemo, useState } from "react"

import { MaintenancePanel } from "@/components/carmate/maintenance-panel"
import { ShopSheet } from "@/components/carmate/overlays"
import {
  getPart,
  type PartKey,
} from "@/lib/carmate-data"

export function MaintenanceView() {
  const [selectedPart, setSelectedPart] = useState<PartKey>(getStoredPart)
  const [shopOpen, setShopOpen] = useState(false)
  const activePart = useMemo(() => getPart(selectedPart), [selectedPart])

  function selectPart(part: PartKey) {
    setSelectedPart(part)
    window.localStorage.setItem("carmate:selected-part", part)
  }

  return (
    <div className="grid gap-5">
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase text-muted-foreground">Maintenance</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
          Maintenance schedule by urgency
        </h1>
        <p className="mt-3 text-muted-foreground">
          Completed records, due-now work, and upcoming tasks are separated so the schedule
          is not confused with service history.
        </p>
      </div>

      <MaintenancePanel
        selectedPart={activePart}
        onSelectPart={selectPart}
        onShop={() => setShopOpen(true)}
      />

      <ShopSheet open={shopOpen} onOpenChange={setShopOpen} part={activePart} />
    </div>
  )
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
