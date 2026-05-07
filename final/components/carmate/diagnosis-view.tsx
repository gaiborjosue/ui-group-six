"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { DiagnosisPanel } from "@/components/carmate/diagnosis-panel"
import {
  buildDiagnosis,
  type Diagnosis,
  type PartKey,
} from "@/lib/carmate-data"
import { useMockBackend } from "./mock-backend"

const demoDiagnostics = [
  {
    code: "P0300",
    issue: "rough-idle",
    custom: "Random or multiple cylinder misfire. Check spark plugs, coils, injectors, and fuel or air delivery.",
  },
  {
    code: "P0301",
    issue: "rough-idle",
    custom: "Cylinder 1 misfire. Check the cylinder-specific plug, coil, injector, wiring, and compression.",
  },
  {
    code: "P0171",
    issue: "rough-idle",
    custom: "System too lean on bank 1. Possible vacuum leak, MAF airflow issue, or fuel delivery issue.",
  },
  {
    code: "P2187",
    issue: "rough-idle",
    custom: "System too lean at idle on bank 1. Check intake leaks, dirty MAF readings, and idle air fuel control.",
  },
  {
    code: "P2188",
    issue: "rough-idle",
    custom: "System too rich at idle on bank 1. Check fueling, MAF readings, leaking injector, or sensor data.",
  },
  {
    code: "P0420",
    issue: "rough-idle",
    custom: "Catalyst efficiency below threshold on bank 1. Check catalytic converter, oxygen sensors, and exhaust leaks.",
  },
  {
    code: "P0455",
    issue: "fluid-leak",
    custom: "Large EVAP leak. Check fuel cap, EVAP hoses, and purge valve.",
  },
  {
    code: "P0004",
    issue: "rough-idle",
    custom: "Fuel volume regulator control circuit high. One 458 owner reported this with P2188 and P2190 after a warning light.",
  },
  {
    code: "",
    issue: "rough-idle",
    custom: "Catalyst converter too hot warning before a check engine light. Check for misfire, fuel dump, bad sensor, exhaust, or catalyst issue.",
  },
]

export function DiagnosisView() {
  const router = useRouter()
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [issue, setIssue] = useState("rough-idle")
  const [scannerCode, setScannerCode] = useState("")
  const [customIssue, setCustomIssue] = useState("")
  const demoIndexRef = useRef(0)
  const { saveDiagnosis } = useMockBackend()

  useEffect(() => {
    function handleDemoShortcut(event: KeyboardEvent) {
      if (
        !event.ctrlKey ||
        !event.altKey ||
        !event.shiftKey ||
        event.key.toLowerCase() !== "e"
      ) {
        return
      }

      event.preventDefault()
      const demo = demoDiagnostics[demoIndexRef.current]

      setScannerCode(demo.code)
      setIssue(demo.issue)
      setCustomIssue(demo.custom)
      toast.success(
        `Demo diagnostic loaded: ${demo.code || "Catalyst temperature warning"}`
      )

      demoIndexRef.current = (demoIndexRef.current + 1) % demoDiagnostics.length
    }

    window.addEventListener("keydown", handleDemoShortcut)

    return () => window.removeEventListener("keydown", handleDemoShortcut)
  }, [])

  function handleDiagnosis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const result = buildDiagnosis(
      scannerCode,
      issue,
      customIssue
    )

    setDiagnosis(result)
    window.localStorage.setItem("carmate:selected-part", result.relatedPart)
    if (formData.has("save-report")) {
      saveDiagnosis(result)
    }
    toast.success("Likely issue generated")
  }

  function openPart(part: PartKey) {
    window.localStorage.setItem("carmate:selected-part", part)
    window.localStorage.setItem("carmate:highlight-part", part)
    router.push("/parts")
  }

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Diagnosis"
        title="Find the likely issue before the shop visit"
        description="A dedicated flow for scanner codes, preset symptoms, and custom issue notes."
      />
      <DiagnosisPanel
        issue={issue}
        scannerCode={scannerCode}
        customIssue={customIssue}
        diagnosis={diagnosis}
        setIssue={setIssue}
        setScannerCode={setScannerCode}
        setCustomIssue={setCustomIssue}
        onSubmit={handleDiagnosis}
        onViewPart={openPart}
      />
    </div>
  )
}

function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-medium uppercase text-muted-foreground">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">{title}</h1>
      <p className="mt-3 text-muted-foreground">{description}</p>
    </div>
  )
}
