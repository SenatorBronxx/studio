
import * as React from "react"
import type { SVGProps } from "react"

export function TelecelCashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="100" height="100" rx="20" fill="#D90000"/>
        <path d="M25 50C25 36.1929 36.1929 25 50 25V37.5C43.0655 37.5 37.5 43.0655 37.5 50H25Z" fill="white"/>
        <path d="M50 75C63.8071 75 75 63.8071 75 50H62.5C62.5 56.9345 56.9345 62.5 50 62.5V75Z" fill="white"/>
        <circle cx="50" cy="50" r="6.25" fill="white"/>
    </svg>
  )
}
