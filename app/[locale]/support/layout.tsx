import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support',
  alternates: {
    canonical: '/fr/support',
  },
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children
}
