import type { Tour } from "@/components/ui/tour"

export const carmateTours = [
  {
    id: "garage-overview",
    steps: [
      {
        id: "active-vehicle",
        title: "Active vehicle",
        content:
          "This is the vehicle profile currently being tracked. The app uses this information across the dashboard, records, and service planning views.",
        side: "right",
        align: "start",
      },
      {
        id: "main-navigation",
        title: "Navigation",
        content:
          "Use these sections to move between diagnosis, maintenance planning, part inspection, and service records.",
        side: "right",
        align: "start",
      },
      {
        id: "vehicle-stage",
        title: "Interactive vehicle",
        content:
          "Select visible parts on the 3D model to inspect their condition and jump into a service plan.",
        side: "bottom",
        align: "center",
      },
      {
        id: "garage-status",
        title: "Garage status",
        content:
          "This panel summarizes what needs attention now, what is upcoming, and how many service records are saved.",
        side: "left",
        align: "start",
      },
      {
        id: "main-actions",
        title: "Core workflows",
        content:
          "These cards are the fastest path into the main tasks: diagnosing an issue, reviewing maintenance, inspecting parts, and sharing records.",
        side: "top",
        align: "center",
        nextLabel: "Finish",
      },
    ],
  },
] satisfies Tour[]
