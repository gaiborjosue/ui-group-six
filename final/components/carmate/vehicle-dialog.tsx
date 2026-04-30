"use client"

import { FormEvent } from "react"
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
import type { Vehicle } from "@/lib/carmate-data"
import { useMockBackend } from "./mock-backend"

export function VehicleDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { vehicle, updateVehicle } = useMockBackend()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const nextVehicle: Vehicle = {
      year: String(formData.get("year") ?? vehicle.year).trim(),
      make: String(formData.get("make") ?? vehicle.make).trim(),
      model: String(formData.get("model") ?? vehicle.model).trim(),
      trim: String(formData.get("trim") ?? vehicle.trim).trim(),
      mileage: String(formData.get("mileage") ?? vehicle.mileage).trim(),
      vin: String(formData.get("vin") ?? vehicle.vin).trim(),
      value: String(formData.get("value") ?? vehicle.value).trim(),
    }

    updateVehicle(nextVehicle)
    onOpenChange(false)
    toast.success("Vehicle profile updated")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit vehicle profile</DialogTitle>
          <DialogDescription>
            Update the vehicle details used across maintenance, records, and exports.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="year">Year</FieldLabel>
              <Input id="year" name="year" defaultValue={vehicle.year} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="make">Make</FieldLabel>
              <Input id="make" name="make" defaultValue={vehicle.make} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="model">Model</FieldLabel>
              <Input id="model" name="model" defaultValue={vehicle.model} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="trim">Trim</FieldLabel>
              <Input id="trim" name="trim" defaultValue={vehicle.trim} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="mileage">Mileage</FieldLabel>
              <Input id="mileage" name="mileage" defaultValue={vehicle.mileage} required />
              <FieldDescription>Used when creating new records.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="value">Estimated value</FieldLabel>
              <Input id="value" name="value" defaultValue={vehicle.value} required />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="vin">VIN</FieldLabel>
              <Input id="vin" name="vin" defaultValue={vehicle.vin} required />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-5">
            <Button type="submit">Save vehicle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
