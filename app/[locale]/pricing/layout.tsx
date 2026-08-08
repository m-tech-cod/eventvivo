import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarifs',
  alternates: {
    canonical: '/fr/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
