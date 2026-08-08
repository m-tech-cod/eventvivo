import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation',
  alternates: {
    canonical: '/fr/terms',
  },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children
}
