
import * as React from "react"
import type { SVGProps } from "react"

export function BusTicketIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 6V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" />
      <path d="M4 6v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6" />
      <path d="M14 12v-2" />
      <path d="M18 12v-2" />
      <path d="M10 12h.01" />
      <path d="M6 12h.01" />
      <path d="m14 18 2 2 4-4" />
      <path d="M4 12h2" />
    </svg>
  )
}
