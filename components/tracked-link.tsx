'use client'

import Link from 'next/link'
import { sendGAEvent } from '@next/third-parties/google'

export function TrackedLink({ href, children, className, label }: any) {
  return (
    <Link 
      href={href} 
      className={className}
      onClick={() => sendGAEvent({ event: 'cta_click', label: label })}
    >
      {children}
    </Link>
  )
}
