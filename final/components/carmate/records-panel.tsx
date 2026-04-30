"use client"

import { FormEvent, useMemo, useState } from "react"
import { ClipboardListIcon, DownloadIcon, Share2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useMockBackend } from "./mock-backend"

export function RecordsPanel({ onExport }: { onExport: () => void }) {
  const { serviceRecords, addServiceRecord, deleteServiceRecord, vehicle } =
    useMockBackend()
  const [recordOpen, setRecordOpen] = useState(false)
  const [query, setQuery] = useState("")
  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return serviceRecords
    }

    return serviceRecords.filter((record) =>
      [
        record.date,
        record.mileage,
        record.service,
        record.shop,
        record.notes,
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    )
  }, [query, serviceRecords])

  async function copyMechanicLink() {
    const link = `https://carmate.local/share/${vehicle.vin.toLowerCase()}`
    await navigator.clipboard.writeText(link)
    toast.success("Mechanic link copied")
  }

  function handleAddRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    addServiceRecord({
      date: String(formData.get("date") ?? ""),
      mileage: String(formData.get("mileage") ?? vehicle.mileage),
      service: String(formData.get("service") ?? ""),
      shop: String(formData.get("shop") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    })
    setRecordOpen(false)
    toast.success("Service record added")
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-5">
        <div>
          <h2 className="text-xl font-semibold">Service history</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep past work organized and ready to share before the next service visit.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setRecordOpen(true)}>
            Add record
          </Button>
          <Button onClick={onExport}>
            <DownloadIcon data-icon="inline-start" />
            Export
          </Button>
          <Button variant="outline" onClick={copyMechanicLink}>
            <Share2Icon data-icon="inline-start" />
            Copy link
          </Button>
        </div>
      </div>

      <Field>
        <FieldLabel htmlFor="record-search">Search service history</FieldLabel>
        <Input
          id="record-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by service, shop, date, or notes"
        />
      </Field>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Shop</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.date}</TableCell>
                <TableCell>{record.mileage}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <ClipboardListIcon className="size-4 text-muted-foreground" />
                    {record.service}
                  </span>
                </TableCell>
                <TableCell>{record.shop}</TableCell>
                <TableCell className="text-muted-foreground">{record.notes}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      deleteServiceRecord(record.id)
                      toast.success("Service record removed")
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No service records match this search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add service record</DialogTitle>
            <DialogDescription>
              Save completed work to the vehicle history.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddRecord}>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="date">Date</FieldLabel>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="mileage">Mileage</FieldLabel>
                  <Input
                    id="mileage"
                    name="mileage"
                    defaultValue={vehicle.mileage}
                    required
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="service">Service</FieldLabel>
                <Input id="service" name="service" placeholder="Annual service" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="shop">Shop</FieldLabel>
                <Input id="shop" name="shop" placeholder="Maranello Boston Service" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="notes">Notes</FieldLabel>
                <Textarea id="notes" name="notes" placeholder="What was completed?" />
                <FieldDescription>Notes appear in the export summary.</FieldDescription>
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-5">
              <Button type="submit">Save record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
