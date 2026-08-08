import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
  alternates: {
    canonical: '/fr/privacy',
  },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
