export type TabValue = "overview" | "diagnose" | "maintenance" | "records"
export type Status = "urgent" | "soon" | "healthy" | "done"
export type PartKey =
  | "engine"
  | "battery"
  | "brakes"
  | "tires"
  | "fluids"
  | "lights"
  | "body"
  | "wipers"

export type Vehicle = {
  year: string
  make: string
  model: string
  trim: string
  mileage: string
  vin: string
  value: string
}

export type Part = {
  key: PartKey
  name: string
  status: Status
  label: string
  summary: string
  next: string
  estimate: string
  progress: number
  position: string
}

export type Diagnosis = {
  title: string
  urgency: Status
  summary: string
  relatedPart: PartKey
  next: string
  estimate: string
}

export const vehicle: Vehicle = {
  year: "2012",
  make: "Ferrari",
  model: "458 Italia",
  trim: "Coupe",
  mileage: "18,240",
  vin: "ZFF67NFA0C0182458",
  value: "$215,000 - $245,000",
}

export const parts: Part[] = [
  {
    key: "engine",
    name: "Engine",
    status: "urgent",
    label: "Due now",
    summary: "A stored misfire code should be checked before the next spirited drive.",
    next: "Inspect plugs, coils, wiring, and compression on the affected bank.",
    estimate: "$420 - $1,200",
    progress: 94,
    position: "left-[17%] top-[46%]",
  },
  {
    key: "battery",
    name: "Battery",
    status: "healthy",
    label: "Healthy",
    summary: "Battery voltage is normal after the latest tender cycle.",
    next: "Keep the vehicle on a tender and retest before long storage.",
    estimate: "$260 - $480",
    progress: 42,
    position: "left-[26%] top-[23%]",
  },
  {
    key: "brakes",
    name: "Brakes",
    status: "soon",
    label: "Upcoming",
    summary: "Carbon-ceramic brake inspection is due before the next track day.",
    next: "Measure pad thickness and inspect rotor surface condition.",
    estimate: "$900 - $2,400",
    progress: 78,
    position: "left-[31%] top-[68%]",
  },
  {
    key: "tires",
    name: "Tires",
    status: "urgent",
    label: "Due now",
    summary: "Rear tire wear is near the service limit and pressure should be reset cold.",
    next: "Measure tread depth, inspect sidewalls, and set cold tire pressure.",
    estimate: "$1,200 - $2,200",
    progress: 100,
    position: "left-[69%] top-[70%]",
  },
  {
    key: "fluids",
    name: "Fluids",
    status: "soon",
    label: "Upcoming",
    summary: "Annual fluid service is approaching for oil, coolant, and dual-clutch fluid.",
    next: "Check oil level, coolant strength, brake fluid age, and DCT fluid condition.",
    estimate: "$900 - $1,800",
    progress: 70,
    position: "left-[49%] top-[18%]",
  },
  {
    key: "lights",
    name: "Lights",
    status: "healthy",
    label: "Healthy",
    summary: "Exterior lighting passed the last inspection.",
    next: "Confirm brake lights, indicators, and front LEDs before weekend drives.",
    estimate: "$120 - $650",
    progress: 28,
    position: "left-[77%] top-[47%]",
  },
  {
    key: "body",
    name: "Body",
    status: "healthy",
    label: "Healthy",
    summary: "Exterior panels and paint are marked clean in the latest inspection.",
    next: "Inspect paint, underbody edges, and front splitter after long drives.",
    estimate: "$180 - $900",
    progress: 34,
    position: "left-[55%] top-[42%]",
  },
  {
    key: "wipers",
    name: "Wipers",
    status: "soon",
    label: "Upcoming",
    summary: "Wiper blades are approaching replacement age for clear wet-weather visibility.",
    next: "Replace blades and confirm washer spray pattern before the next rainy drive.",
    estimate: "$80 - $180",
    progress: 64,
    position: "left-[50%] top-[31%]",
  },
]

export const visualParts = parts.filter((part) =>
  ["tires", "brakes", "lights", "body", "wipers"].includes(part.key)
)

export const maintenanceGroups = [
  {
    title: "Completed",
    items: [
      {
        name: "Oil change",
        detail: "Completed at 17,920 miles on March 18, 2026.",
        status: "done" as Status,
        progress: 100,
      },
      {
        name: "Battery tender test",
        detail: "Tender, terminals, and voltage were checked during the last service visit.",
        status: "done" as Status,
        progress: 100,
      },
    ],
  },
  {
    title: "Due now",
    items: [
      {
        name: "Rear tire inspection",
        detail: "Rear tires are near the service limit after the last seasonal drive.",
        status: "urgent" as Status,
        progress: 100,
      },
      {
        name: "Engine misfire check",
        detail: "Misfire code logged. Inspect plugs, coils, and wiring before hard driving.",
        status: "urgent" as Status,
        progress: 96,
      },
    ],
  },
  {
    title: "Upcoming",
    items: [
      {
        name: "Carbon-ceramic brake inspection",
        detail: "Recommended before the next track day or long mountain drive.",
        status: "soon" as Status,
        progress: 78,
      },
      {
        name: "Annual fluid service",
        detail: "Review oil, coolant, brake fluid, and DCT fluid condition.",
        status: "soon" as Status,
        progress: 65,
      },
    ],
  },
]

export const serviceRecords = [
  {
    date: "2026-03-18",
    mileage: "17,920",
    service: "Annual oil service and battery tender test",
    shop: "Maranello Boston Service",
    notes: "Factory-spec oil. Next annual service due at 19,500 miles or March 2027.",
  },
  {
    date: "2025-11-02",
    mileage: "17,280",
    service: "Carbon-ceramic brake inspection",
    shop: "Prancing Horse Performance",
    notes: "Front pads measured at 42 percent. Rotors within spec.",
  },
  {
    date: "2025-08-14",
    mileage: "16,840",
    service: "Tire pressure reset and alignment check",
    shop: "Corsa Tire Studio",
    notes: "Rear tread measured low-normal. Cold pressures reset.",
  },
]

export function getPart(key: PartKey) {
  return parts.find((part) => part.key === key) ?? parts[0]
}

export function buildDiagnosis(code: string, issue: string, custom: string): Diagnosis {
  const normalizedCode = code.trim().toUpperCase()
  const normalizedCustom = custom.trim().toLowerCase()

  if (
    normalizedCode.includes("P0301") ||
    issue === "rough-idle" ||
    normalizedCustom.includes("shake") ||
    normalizedCustom.includes("misfire")
  ) {
    return {
      title: "Likely cylinder 1 misfire",
      urgency: "urgent",
      summary:
        "The engine should be checked before the next spirited drive. Start with spark plug and ignition coil inspection.",
      relatedPart: "engine",
      next: "Inspect spark plug, ignition coil, and wiring.",
      estimate: getPart("engine").estimate,
    }
  }

  if (
    issue === "fluid-leak" ||
    normalizedCustom.includes("leak") ||
    normalizedCustom.includes("coolant") ||
    normalizedCustom.includes("oil")
  ) {
    return {
      title: "Possible fluid leak",
      urgency: "urgent",
      summary:
        "Park on a clean surface and identify the fluid color before driving long distances.",
      relatedPart: "fluids",
      next: "Check oil, coolant, brake fluid, and transmission fluid levels.",
      estimate: getPart("fluids").estimate,
    }
  }

  if (
    issue === "brake-noise" ||
    normalizedCustom.includes("brake") ||
    normalizedCustom.includes("squeal") ||
    normalizedCustom.includes("grind")
  ) {
    return {
      title: "Brake inspection recommended",
      urgency: "soon",
      summary: "Noise can come from worn pads, rotor issues, or debris near the caliper.",
      relatedPart: "brakes",
      next: "Check front pads and rotor surface.",
      estimate: getPart("brakes").estimate,
    }
  }

  if (
    issue === "tire-wear" ||
    normalizedCustom.includes("tire") ||
    normalizedCustom.includes("vibration") ||
    normalizedCustom.includes("pull")
  ) {
    return {
      title: "Tire rotation and tread check",
      urgency: "urgent",
      summary:
        "Uneven wear can point to missed rotation, pressure imbalance, or alignment issues.",
      relatedPart: "tires",
      next: "Rotate tires and measure tread depth.",
      estimate: getPart("tires").estimate,
    }
  }

  return {
    title: "General inspection recommended",
    urgency: "healthy",
    summary:
      "The issue is not specific enough yet. Start with visible leaks, tire pressure, battery, and dashboard lights.",
    relatedPart: "battery",
    next: "Run a basic inspection checklist and add more symptoms.",
    estimate: getPart("battery").estimate,
  }
}
