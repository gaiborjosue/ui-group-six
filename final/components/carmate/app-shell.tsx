"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardListIcon,
  GaugeIcon,
  MapPinIcon,
  MessageSquareTextIcon,
  PackageSearchIcon,
  Share2Icon,
  WrenchIcon,
} from "lucide-react"
import { useState } from "react"

import { ExportDialog, ShopSheet } from "@/components/carmate/overlays"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
  const [exportOpen, setExportOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const { vehicle, lastUpdated } = useMockBackend()

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="sticky top-0 border-b bg-background/95 backdrop-blur lg:hidden">
        <div className="flex min-h-14 items-center justify-between gap-3 px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                CM
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-semibold">CarMate</span>
          </Link>
          <div className="flex items-center gap-2">
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
          <nav className="flex gap-1 px-4 pb-2" aria-label="Mobile navigation">
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
              <div className="rounded-lg border bg-card p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Active vehicle
                  </span>
                  <Badge variant="secondary" className="rounded-md">
                    Demo
                  </Badge>
                </div>
                <strong className="mt-2 block text-sm">
                  {vehicle.trim}
                </strong>
                <span className="text-xs text-muted-foreground">
                  {vehicle.mileage} miles, value {vehicle.value}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Updated {lastUpdated}
                </span>
              </div>
            </div>

            <Separator />

            <nav className="grid gap-1 p-3" aria-label="Sidebar navigation">
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
