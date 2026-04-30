"use client"

import { useState } from "react"

import { ExportDialog } from "@/components/carmate/overlays"
import { RecordsPanel } from "@/components/carmate/records-panel"

export function RecordsView() {
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <div className="grid gap-5">
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase text-muted-foreground">Records</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
          Service history and exports
        </h1>
        <p className="mt-3 text-muted-foreground">
          A mechanic-ready view for past work, export formats, and shareable summaries.
        </p>
      </div>

      <RecordsPanel onExport={() => setExportOpen(true)} />
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}
