"use client"

import { WrenchIcon } from "lucide-react"

import { CarScene } from "@/components/car-scene"
import { Button } from "@/components/ui/button"
import { parts, type Part, type PartKey } from "@/lib/carmate-data"
import { StatusBadge } from "./shared"

type VehicleStageProps = {
  activePart: Part
  selectedPart: PartKey
  onSelectPart: (part: PartKey) => void
  onViewPlan: () => void
}

export function VehicleStage({
  activePart,
  selectedPart,
  onSelectPart,
  onViewPlan,
}: VehicleStageProps) {
  return (
    <section className="relative">
      <CarScene selectedPart={selectedPart} onSelectPart={onSelectPart} />

      <div className="absolute left-4 top-4 max-w-xs rounded-lg border border-background/20 bg-background/90 p-4 shadow-sm backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Selected part</p>
            <h2 className="mt-1 text-xl font-semibold">{activePart.name}</h2>
          </div>
          <StatusBadge status={activePart.status} label={activePart.label} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{activePart.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={onViewPlan}>
            <WrenchIcon data-icon="inline-start" />
            View plan
          </Button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:hidden">
        {parts.map((part) => (
          <Button
            key={part.key}
            type="button"
            variant={selectedPart === part.key ? "default" : "outline"}
            onClick={() => onSelectPart(part.key)}
          >
            {part.name}
          </Button>
        ))}
      </div>
    </section>
  )
}
