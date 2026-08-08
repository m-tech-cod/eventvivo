import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Foire aux questions',
  alternates: {
    canonical: '/fr/faq',
  },
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children
}
