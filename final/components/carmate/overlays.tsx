"use client"

import { useState, type FormEvent } from "react"
import Image from "next/image"
import { format, startOfDay } from "date-fns"
import {
  CalendarClockIcon,
  ChevronDownIcon,
  ClipboardListIcon,
  DownloadIcon,
  QrCodeIcon,
  Share2Icon,
} from "lucide-react"
import QRCode from "qrcode"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Part } from "@/lib/carmate-data"
import { cn } from "@/lib/utils"
import { useMockBackend } from "./mock-backend"

export function ExportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { serviceRecords, vehicle } = useMockBackend()
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [qrPayload, setQrPayload] = useState("")
  const mechanicShareUrl = `https://carmate.local/share/${vehicle.vin.toLowerCase()}`
  const options = [
    {
      label: "Download report",
      icon: DownloadIcon,
      action: () => {
        downloadTextFile(
          "carmate-service-report.txt",
          [
            `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            `${vehicle.mileage} miles`,
            "",
            ...serviceRecords.map(
              (record) =>
                `${record.date} | ${record.mileage} | ${record.service} | ${record.shop} | ${record.notes}`
            ),
          ].join("\n")
        )
        toast.success("Report downloaded")
      },
    },
    {
      label: "Download CSV",
      icon: ClipboardListIcon,
      action: () => {
        downloadTextFile(
          "carmate-service-history.csv",
          [
            "Date,Mileage,Service,Shop,Notes",
            ...serviceRecords.map((record) =>
              [record.date, record.mileage, record.service, record.shop, record.notes]
                .map(csvEscape)
                .join(",")
            ),
          ].join("\n")
        )
        toast.success("CSV downloaded")
      },
    },
    {
      label: "Copy mechanic link",
      icon: Share2Icon,
      action: async () => {
        await navigator.clipboard.writeText(mechanicShareUrl)
        toast.success("Mechanic link copied")
      },
    },
    {
      label: "Show QR handoff",
      icon: QrCodeIcon,
      action: async () => {
        const dataUrl = await QRCode.toDataURL(mechanicShareUrl, {
          width: 220,
          margin: 2,
          color: {
            dark: "#111827",
            light: "#ffffff",
          },
        })

        setQrPayload(mechanicShareUrl)
        setQrCodeUrl(dataUrl)
        toast.success("QR code generated")
      },
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share service information</DialogTitle>
          <DialogDescription>
            Choose a format for mechanic visits, resale records, or personal backup.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((option) => (
            <Button
              key={option.label}
              variant="outline"
              className="justify-start"
              onClick={option.action}
            >
              <option.icon data-icon="inline-start" />
              {option.label}
            </Button>
          ))}
        </div>

        {qrCodeUrl && (
          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Image
                src={qrCodeUrl}
                alt="QR code for the mechanic share link"
                width={132}
                height={132}
                unoptimized
                className="rounded-lg border bg-white p-2"
              />
              <div className="min-w-0 flex-1">
                <strong>Mechanic QR handoff</strong>
                <p className="mt-1 text-sm text-muted-foreground">
                  Scan this code at the service desk to open the simulated shared
                  service summary.
                </p>
                <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
                  {qrPayload}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={async () => {
                    await navigator.clipboard.writeText(qrPayload)
                    toast.success("QR link copied")
                  }}
                >
                  <Share2Icon data-icon="inline-start" />
                  Copy QR link
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}

export function ShopSheet({
  open,
  onOpenChange,
  part,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  part: Part
}) {
  const { addAppointment } = useMockBackend()
  const [selectedShop, setSelectedShop] = useState("Maranello Boston Service")
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [appointmentDate, setAppointmentDate] = useState<Date>()
  const [appointmentTime, setAppointmentTime] = useState("10:30")
  const shops = [
    ["Maranello Boston Service", "0.8 mi", "Factory-trained Ferrari service"],
    ["Prancing Horse Performance", "1.4 mi", "Brake and track inspection"],
    ["Corsa Tire Studio", "2.1 mi", "Performance tires and alignment"],
  ]

  function requestAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!appointmentDate) {
      toast.error("Choose an appointment date")
      return
    }

    addAppointment({
      shop: selectedShop,
      partName: part.name,
      date: format(appointmentDate, "yyyy-MM-dd"),
      time: appointmentTime,
    })
    toast.success("Appointment request saved")
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nearby shop options</SheetTitle>
          <SheetDescription>
            Local service options for the selected part: {part.name}.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-3 px-4">
          {shops.map(([name, distance, detail]) => (
            <button
              key={name}
              type="button"
              className={cn(
                "rounded-lg border bg-background p-4 text-left transition hover:bg-muted",
                selectedShop === name && "border-primary"
              )}
              onClick={() => setSelectedShop(name)}
            >
              <div className="flex items-center justify-between gap-3">
                <strong>{name}</strong>
                <Badge variant="secondary" className="rounded-md">
                  {distance}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
            </button>
          ))}
        </div>

        <form onSubmit={requestAppointment} className="grid gap-4 px-4">
          <FieldGroup className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem]">
            <Field>
              <FieldLabel htmlFor="appointment-date">Date</FieldLabel>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    id="appointment-date"
                    className="justify-between font-normal"
                  >
                    {appointmentDate ? format(appointmentDate, "PPP") : "Select date"}
                    <ChevronDownIcon data-icon="inline-end" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={appointmentDate}
                    captionLayout="dropdown"
                    defaultMonth={appointmentDate}
                    disabled={{ before: startOfDay(new Date()) }}
                    onSelect={(date) => {
                      setAppointmentDate(date)
                      setDatePickerOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </Field>
            <Field>
              <FieldLabel htmlFor="appointment-time">Time</FieldLabel>
              <Input
                id="appointment-time"
                name="time"
                type="time"
                step="900"
                value={appointmentTime}
                onChange={(event) => setAppointmentTime(event.target.value)}
                required
                className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
            </Field>
          </FieldGroup>
          <FieldDescription>
            Request will be saved to the simulated appointment queue.
          </FieldDescription>
          <SheetFooter className="px-0">
            <Button type="submit">
              <CalendarClockIcon data-icon="inline-start" />
              Request appointment
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}
