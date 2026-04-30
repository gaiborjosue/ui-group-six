"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { DiagnosisPanel } from "@/components/carmate/diagnosis-panel"
import {
  buildDiagnosis,
  type Diagnosis,
  type PartKey,
} from "@/lib/carmate-data"
import { useMockBackend } from "./mock-backend"

export function DiagnosisView() {
  const router = useRouter()
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [issue, setIssue] = useState("rough-idle")
  const { saveDiagnosis } = useMockBackend()

  function handleDiagnosis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const result = buildDiagnosis(
      String(formData.get("code") ?? ""),
      issue,
      String(formData.get("custom") ?? "")
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
        diagnosis={diagnosis}
        setIssue={setIssue}
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
