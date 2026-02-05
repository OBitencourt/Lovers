'use client'

import Link from 'next/link'
import { sendGAEvent } from '@next/third-parties/google'

export function TrackedLink({ href, children, className, eventName, eventValue }: any) {
  return (
    <Link 
      href={href} 
      className={className}
      onClick={() => sendGAEvent({ event: eventName, value: eventValue })}
    >
      {children}
    </Link>
  )
}
