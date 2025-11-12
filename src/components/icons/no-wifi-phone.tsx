
import * as React from "react"
import type { SVGProps } from "react"

export function NoWifiPhoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Phone Body */}
      <rect x="6" y="2" width="12" height="20" rx="2" ry="2" />
      
      {/* Screen area */}
      <path d="M7 3H17" />
      <path d="M7 21H17" />

      {/* Wifi Off Symbol */}
      <line x1="1" y1="1" x2="23" y2="23" transform="translate(7.5 7.5) scale(0.4)" />
      <path d="M16.88 12.88a4.95 4.95 0 0 0-8.76 0" transform="translate(7.5 7.5) scale(0.4)" />
      <path d="M19.94 9.94a8.5 8.5 0 0 0-14.88 0" transform="translate(7.5 7.5) scale(0.4)" />
      <path d="M22 7a12 12 0 0 0-20 0" transform="translate(7.5 7.5) scale(0.4)" />
      <line x1="12" y1="20" x2="12.01" y2="20" transform="translate(7.5 7.5) scale(0.4)" />
    </svg>
  )
}
