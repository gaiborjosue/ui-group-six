import type { Vehicle } from "@/lib/carmate-data"

const NHTSA_BASE_URL = "https://api.nhtsa.gov"
const CACHE_TTL_MS = 1000 * 60 * 60 * 12

export type VehicleSafetyInsights = {
  recallCount: number | null
  complaintCount: number | null
  overallRating: string | null
  matchedModel: string
  updatedAt: string
  recalls: NhtsaRecall[]
  complaints: NhtsaComplaint[]
}

export type NhtsaRecall = {
  Manufacturer?: string
  NHTSACampaignNumber?: string
  NHTSAActionNumber?: string
  ReportReceivedDate?: string
  Component?: string
  Summary?: string
  Consequence?: string
  Remedy?: string
  Notes?: string
}

export type NhtsaComplaint = {
  odiNumber?: number
  manufacturer?: string
  crash?: boolean
  fire?: boolean
  numberOfInjuries?: number
  numberOfDeaths?: number
  dateOfIncident?: string
  dateComplaintFiled?: string
  vin?: string
  components?: string
  summary?: string
}

type NhtsaListResponse<T> = {
  Count?: number
  count?: number
  Results?: T[]
  results?: T[]
}

type RatingVariantResponse = {
  Results?: {
    VehicleId?: number
    VehicleDescription?: string
  }[]
}

type RatingVehicleResponse = {
  Results?: {
    OverallRating?: string
    OverallFrontCrashRating?: string
    OverallSideCrashRating?: string
    RolloverRating?: string
  }[]
}

type CachedInsights = {
  timestamp: number
  data: VehicleSafetyInsights
}

export async function getVehicleSafetyInsights(
  vehicle: Vehicle,
  signal?: AbortSignal
) {
  const cacheKey = getCacheKey(vehicle)
  const cached = getCachedInsights(cacheKey)

  if (cached) {
    return cached
  }

  const candidates = getModelCandidates(vehicle.model)
  let bestMatch: {
    model: string
    recallCount: number | null
    complaintCount: number | null
    recalls: NhtsaRecall[]
    complaints: NhtsaComplaint[]
    score: number
  } | null = null

  for (const model of candidates) {
    const [recalls, complaints] = await Promise.all([
      fetchList<NhtsaRecall>("recalls/recallsByVehicle", vehicle, model, signal),
      fetchList<NhtsaComplaint>(
        "complaints/complaintsByVehicle",
        vehicle,
        model,
        signal
      ),
    ])
    const recallCount = getResponseCount(recalls)
    const complaintCount = getResponseCount(complaints)
    const recallResults = getResponseResults(recalls)
    const complaintResults = getResponseResults(complaints)

    const score = (recallCount ?? 0) + (complaintCount ?? 0)

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = {
        model,
        recallCount,
        complaintCount,
        recalls: recallResults,
        complaints: complaintResults,
        score,
      }
    }
  }

  const overallRating = await fetchOverallRating(vehicle, candidates, signal)
  const data: VehicleSafetyInsights = {
    recallCount: bestMatch?.recallCount ?? null,
    complaintCount: bestMatch?.complaintCount ?? null,
    overallRating,
    matchedModel: bestMatch?.model ?? candidates[0] ?? vehicle.model,
    recalls: bestMatch?.recalls ?? [],
    complaints: bestMatch?.complaints ?? [],
    updatedAt: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date()),
  }

  setCachedInsights(cacheKey, data)

  return data
}

function getCacheKey(vehicle: Vehicle) {
  return [
    "carmate:nhtsa:v3",
    vehicle.year.trim().toLowerCase(),
    vehicle.make.trim().toLowerCase(),
    vehicle.model.trim().toLowerCase(),
  ].join(":")
}

function getCachedInsights(cacheKey: string) {
  if (typeof window === "undefined") {
    return null
  }

  const rawValue = window.localStorage.getItem(cacheKey)

  if (!rawValue) {
    return null
  }

  try {
    const cached = JSON.parse(rawValue) as CachedInsights

    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      window.localStorage.removeItem(cacheKey)
      return null
    }

    return cached.data
  } catch {
    window.localStorage.removeItem(cacheKey)
    return null
  }
}

function setCachedInsights(cacheKey: string, data: VehicleSafetyInsights) {
  if (typeof window === "undefined") {
    return
  }

  const cached: CachedInsights = {
    timestamp: Date.now(),
    data,
  }

  window.localStorage.setItem(cacheKey, JSON.stringify(cached))
}

function getModelCandidates(model: string) {
  const trimmedModel = model.trim()
  const candidates = new Set<string>()

  if (trimmedModel) {
    candidates.add(trimmedModel)
  }

  const numericMatch = trimmedModel.match(/\d{2,}/)
  if (numericMatch) {
    candidates.add(numericMatch[0])
  }

  const firstWord = trimmedModel.split(/\s+/)[0]
  if (firstWord) {
    candidates.add(firstWord)
  }

  return [...candidates]
}

async function fetchList<T>(
  endpoint: string,
  vehicle: Vehicle,
  model: string,
  signal?: AbortSignal
) {
  const url = new URL(`${NHTSA_BASE_URL}/${endpoint}`)
  url.searchParams.set("modelYear", vehicle.year)
  url.searchParams.set("make", vehicle.make)
  url.searchParams.set("model", model)

  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`NHTSA request failed: ${response.status}`)
  }

  return (await response.json()) as NhtsaListResponse<T>
}

function getResponseCount<T>(data: NhtsaListResponse<T>) {
  const count = data.Count ?? data.count

  if (typeof count === "number") {
    return count
  }

  return data.Results?.length ?? data.results?.length ?? 0
}

function getResponseResults<T>(data: NhtsaListResponse<T>) {
  return data.Results ?? data.results ?? []
}

async function fetchOverallRating(
  vehicle: Vehicle,
  candidates: string[],
  signal?: AbortSignal
) {
  for (const model of candidates) {
    const variants = await fetchRatingVariants(vehicle, model, signal)
    const vehicleId = variants.Results?.[0]?.VehicleId

    if (!vehicleId) {
      continue
    }

    const rating = await fetchRatingVehicle(vehicleId, signal)
    const result = rating.Results?.[0]
    const overallRating = result?.OverallRating

    if (overallRating && overallRating !== "Not Rated") {
      return overallRating
    }

    return overallRating ?? null
  }

  return null
}

async function fetchRatingVariants(
  vehicle: Vehicle,
  model: string,
  signal?: AbortSignal
) {
  const url = `${NHTSA_BASE_URL}/SafetyRatings/modelyear/${encodeURIComponent(
    vehicle.year
  )}/make/${encodeURIComponent(vehicle.make)}/model/${encodeURIComponent(model)}`
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new Error(`NHTSA ratings request failed: ${response.status}`)
  }

  return (await response.json()) as RatingVariantResponse
}

async function fetchRatingVehicle(vehicleId: number, signal?: AbortSignal) {
  const response = await fetch(`${NHTSA_BASE_URL}/SafetyRatings/VehicleId/${vehicleId}`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`NHTSA vehicle rating request failed: ${response.status}`)
  }

  return (await response.json()) as RatingVehicleResponse
}
