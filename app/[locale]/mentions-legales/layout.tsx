import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales',
  alternates: {
    canonical: '/fr/mentions-legales',
  },
}

export default function MentionsLegalesLayout({ children }: { children: React.ReactNode }) {
  return children
}
