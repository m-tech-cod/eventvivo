import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nous contacter',
  alternates: {
    canonical: '/fr/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
