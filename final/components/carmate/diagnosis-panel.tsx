"use client"

import type { FormEvent } from "react"
import { CarIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Diagnosis, PartKey } from "@/lib/carmate-data"
import { getPart } from "@/lib/carmate-data"
import { InfoRow, StatusBadge } from "./shared"

type DiagnosisPanelProps = {
  issue: string
  diagnosis: Diagnosis | null
  setIssue: (issue: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onViewPart: (part: PartKey) => void
}

export function DiagnosisPanel({
  issue,
  diagnosis,
  setIssue,
  onSubmit,
  onViewPart,
}: DiagnosisPanelProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <form onSubmit={onSubmit} className="rounded-lg border bg-card p-5">
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Issue intake</FieldLegend>
            <FieldDescription>
              Add a scanner code, choose a symptom, or describe what you noticed.
            </FieldDescription>

            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="code">Scanner code</FieldLabel>
                <Input id="code" name="code" placeholder="Example: P0301" autoComplete="off" />
                <FieldDescription>OBD-II codes usually start with a letter.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Common issue</FieldLabel>
                <Select value={issue} onValueChange={setIssue}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an issue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="rough-idle">Rough idle or shaking</SelectItem>
                      <SelectItem value="fluid-leak">Fluid leak</SelectItem>
                      <SelectItem value="brake-noise">Brake noise</SelectItem>
                      <SelectItem value="tire-wear">Uneven tire wear</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>Preset paths keep the flow quick.</FieldDescription>
              </Field>
            </FieldGroup>

            <Field>
              <FieldLabel htmlFor="custom">Custom issue</FieldLabel>
              <Textarea
                id="custom"
                name="custom"
                placeholder="Example: the car vibrates at highway speed after rain"
              />
              <FieldDescription>
                Include sounds, smells, warning lights, or when the problem happens.
              </FieldDescription>
            </Field>

            <Field orientation="horizontal">
              <Checkbox id="save-report" name="save-report" defaultChecked />
              <FieldContent>
                <FieldLabel htmlFor="save-report">Save this diagnosis to service records</FieldLabel>
                <FieldDescription>Add this result to the vehicle timeline.</FieldDescription>
              </FieldContent>
            </Field>
          </FieldSet>

          <div className="flex flex-wrap gap-2">
            <Button type="submit">
              <SearchIcon data-icon="inline-start" />
              Show likely issue
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => toast.info("Demo scanner code P0301 ready to type")}
            >
              Use P0301
            </Button>
          </div>
        </FieldGroup>
      </form>

      <div className="rounded-lg border bg-card p-5">
        <h2 className="text-xl font-semibold">Result</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The diagnosis card gives a likely starting point, not a mechanic replacement.
        </p>

        {diagnosis ? (
          <div className="mt-5 flex flex-col gap-4">
            <div className="rounded-lg border bg-background p-4">
              <StatusBadge
                status={diagnosis.urgency}
                label={diagnosis.urgency === "urgent" ? "Urgent" : "Review"}
              />
              <h3 className="mt-3 text-lg font-semibold">{diagnosis.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{diagnosis.summary}</p>
            </div>
            <InfoRow label="Related part" value={getPart(diagnosis.relatedPart).name} />
            <InfoRow label="Next step" value={diagnosis.next} />
            <InfoRow label="Estimated range" value={diagnosis.estimate} />
            <Button onClick={() => onViewPart(diagnosis.relatedPart)}>
              <CarIcon data-icon="inline-start" />
              View related part
            </Button>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed bg-background p-5 text-sm text-muted-foreground">
            Enter a code, choose a symptom, or describe the problem to generate a likely
            issue card.
          </div>
        )}
      </div>
    </div>
  )
}
