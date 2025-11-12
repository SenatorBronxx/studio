
import * as React from "react"
import type { SVGProps } from "react"

export function LostBallIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      fill="none"
      {...props}
    >
        <g>
            <path
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                d="M 20,150 Q 60,130 100,150 T 180,150"
                fill="none"
                opacity="0.6"
            />
            <path
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                d="M 20,160 Q 60,140 100,160 T 180,160"
                fill="none"
            />
             <path
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                d="M 20,170 Q 60,150 100,170 T 180,170"
                fill="none"
                opacity="0.4"
            />
            <circle cx="100" cy="100" r="20" fill="currentColor" />
        </g>
    </svg>
  )
}
