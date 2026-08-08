import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Donner mon avis',
  alternates: {
    canonical: '/fr/feedback',
  },
}

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children
}
