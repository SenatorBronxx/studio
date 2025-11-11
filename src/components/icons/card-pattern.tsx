
'use client';

import * as React from "react"
import type { SVGProps } from "react"

export function CardPattern(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <pattern
          id="a"
          width={40}
          height={40}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <path
            d="M0 0h20v40H0z"
            fill="currentColor"
            fillOpacity={0.1}
          />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#a)"
      />
    </svg>
  )
}
