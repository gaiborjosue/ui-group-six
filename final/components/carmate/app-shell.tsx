"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ClipboardListIcon,
  CircleHelpIcon,
  GaugeIcon,
  MapPinIcon,
  MessageSquareTextIcon,
  MoonIcon,
  PackageSearchIcon,
  Share2Icon,
  SunIcon,
  WrenchIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

import { ExportDialog, ShopSheet } from "@/components/carmate/overlays"
import { VehicleSafetySummary } from "@/components/carmate/vehicle-safety-summary"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useTour } from "@/components/ui/tour"
import { getPart } from "@/lib/carmate-data"
import { cn } from "@/lib/utils"
import { useMockBackend } from "./mock-backend"

const navItems = [
  { href: "/", label: "Garage", icon: GaugeIcon },
  { href: "/diagnose", label: "Diagnose", icon: MessageSquareTextIcon },
  { href: "/maintenance", label: "Maintenance", icon: WrenchIcon },
  { href: "/parts", label: "Parts", icon: PackageSearchIcon },
  { href: "/records", label: "Records", icon: ClipboardListIcon },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [exportOpen, setExportOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const { vehicle, lastUpdated } = useMockBackend()
  const { start } = useTour()

  useEffect(() => {
    if (pathname !== "/") {
      return
    }

    if (window.localStorage.getItem("carmate:onboarding-tour-seen")) {
      return
    }

    const timeout = window.setTimeout(() => {
      window.localStorage.setItem("carmate:onboarding-tour-seen", "true")
      start("garage-overview")
    }, 700)

    return () => window.clearTimeout(timeout)
  }, [pathname, start])

  function startGarageTour() {
    if (pathname !== "/") {
      router.push("/")
      window.setTimeout(() => start("garage-overview"), 300)
      return
    }

    start("garage-overview")
  }

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="sticky top-0 border-b bg-background/95 backdrop-blur lg:hidden">
        <div className="flex min-h-14 items-center justify-between gap-3 px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2" data-tour-step-id="active-vehicle">
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                CM
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-semibold">CarMate</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <Button variant="outline" size="icon-sm" onClick={startGarageTour}>
              <CircleHelpIcon />
              <span className="sr-only">Start onboarding tour</span>
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => setExportOpen(true)}>
              <Share2Icon />
              <span className="sr-only">Share service information</span>
            </Button>
            <Button size="icon-sm" onClick={() => setShopOpen(true)}>
              <MapPinIcon />
              <span className="sr-only">Nearby shops</span>
            </Button>
          </div>
        </div>
        <ScrollArea>
          <nav
            className="flex gap-1 px-4 pb-2"
            aria-label="Mobile navigation"
            data-tour-step-id="main-navigation"
          >
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={isActive(pathname, item.href) ? "secondary" : "ghost"}
                size="sm"
                className="shrink-0"
              >
                <Link href={item.href}>
                  <item.icon data-icon="inline-start" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </ScrollArea>
      </header>

      <div className="grid lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-svh border-r bg-background lg:block">
          <div className="flex h-full flex-col">
            <div className="p-4 pb-3">
              <Link href="/" className="mb-4 flex items-center gap-3">
                <Avatar className="size-10 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                    CM
                  </AvatarFallback>
                </Avatar>
                <span className="grid min-w-0">
                  <span className="truncate text-base font-semibold leading-none">CarMate</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Vehicle care workspace
                  </span>
                </span>
              </Link>
              <div className="rounded-lg border bg-card p-3" data-tour-step-id="active-vehicle">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Active vehicle
                  </span>
                  <Badge variant="secondary" className="rounded-md">
                    Demo
                  </Badge>
                </div>
                <strong className="mt-2 block text-sm">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </strong>
                <span className="text-xs text-muted-foreground">
                  {vehicle.mileage} miles, value {vehicle.value}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Updated {lastUpdated}
                </span>
                <VehicleSafetySummary vehicle={vehicle} />
              </div>
            </div>

            <Separator />

            <nav
              className="grid gap-1 p-3"
              aria-label="Sidebar navigation"
              data-tour-step-id="main-navigation"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                    isActive(pathname, item.href) && "bg-muted text-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto p-4">
              <ThemeToggle />
              <div className="grid gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
                <strong>Backend is being simulated.</strong>
                <div className="grid gap-2">
                  <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
                    <Share2Icon data-icon="inline-start" />
                    Share records
                  </Button>
                  <Button size="sm" onClick={() => setShopOpen(true)}>
                    <MapPinIcon data-icon="inline-start" />
                    Nearby shops
                  </Button>
                  <Button variant="outline" size="sm" onClick={startGarageTour}>
                    <CircleHelpIcon data-icon="inline-start" />
                    Tour
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-5 md:px-6 lg:px-8">{children}</main>
      </div>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
      <ShopSheet open={shopOpen} onOpenChange={setShopOpen} part={getPart("engine")} />
    </div>
  )
}

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href
  }

  return pathname.startsWith(href)
}

function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true))

    return () => window.cancelAnimationFrame(frame)
  }, [])

  function toggleTheme() {
    setTheme(isDark ? "light" : "dark")
  }

  if (compact) {
    return (
      <Button
        variant="outline"
        size="icon-sm"
        onClick={toggleTheme}
        disabled={!mounted}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
        <span className="sr-only">Toggle light and dark mode</span>
      </Button>
    )
  }

  return (
    <div className="mb-3 rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {isDark ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
          <span className="text-sm font-medium">{isDark ? "Dark mode" : "Light mode"}</span>
        </div>
        <Switch
          checked={isDark}
          onCheckedChange={toggleTheme}
          disabled={!mounted}
          aria-label="Toggle light and dark mode"
        />
      </div>
    </div>
  )
}
