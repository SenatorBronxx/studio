
import * as React from "react"
import type { SVGProps } from "react"

export function AtMoneyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="100" height="100" rx="20" fill="#00A8A8"/>
      <path d="M25 37.5L50 62.5L75 37.5" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M25 62.5L50 87.5L75 62.5" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6"/>
      <path d="M50 12.5V37.5" stroke="white" strokeWidth="10" strokeLinecap="round"/>
    </svg>
  )
}
