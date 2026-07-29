'use client'

import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1">
      <span className="text-[#1E3A8A] font-bold text-3xl font-poppins">Event</span>
      <span className="text-[#F59E0B] font-bold text-3xl font-poppins">vivo</span>
    </Link>
  )
}