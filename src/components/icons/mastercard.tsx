
import * as React from "react"
import type { SVGProps } from "react"

export function MastercardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="48px"
      height="48px"
      {...props}
    >
      <path
        fill="#ff9800"
        d="M32 10A14 14 0 10 32 38A14 14 0 10 32 10"
      ></path>
      <path
        fill="#d50000"
        d="M16 10A14 14 0 10 16 38A14 14 0 10 16 10"
      ></path>
      <path
        fill="#ff3d00"
        d="M18,24c0,4.755,2.376,8.95,6,11.48c3.624-2.53,6-6.725,6-11.48s-2.376-8.95-6-11.48C20.376,15.05,18,19.245,18,24z"
      ></path>
    </svg>
  )
}
