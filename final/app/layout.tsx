import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata, Viewport } from "next"

import "./globals.css"
import { AppShell } from "@/components/carmate/app-shell"
import { MockBackendProvider } from "@/components/carmate/mock-backend"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TourProvider } from "@/components/ui/tour"
import { carmateTours } from "@/lib/carmate-tour"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "CarMate | Vehicle Care Workspace",
  description:
    "Diagnose car issues, track maintenance, and share service history from one vehicle care workspace.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <MockBackendProvider>
              <TourProvider tours={carmateTours}>
                <AppShell>{children}</AppShell>
              </TourProvider>
            </MockBackendProvider>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
