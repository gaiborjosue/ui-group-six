import { MaintenancePanel } from "@/components/carmate/maintenance-panel"

export function MaintenanceView() {
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

      <MaintenancePanel />
    </div>
  )
}
