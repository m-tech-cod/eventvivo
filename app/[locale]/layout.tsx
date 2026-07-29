// app/[locale]/layout.tsx
import { Inter, Poppins } from 'next/font/google'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { MobileNavigation } from '@/components/layout/MobileNavigation'
import { Footer } from '@/components/layout/Footer'
import { PageTransition } from '@/components/ui/PageTransition' // ⬅️ Nouveau
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

export const metadata = {
  metadataBase: new URL('https://eventvivo.com'),
  title: {
    default: 'Eventvivo - Organisez vos événements sans stress',
    template: '%s | Eventvivo',
  },
  description: 'Invitations numériques, RSVP, QR Codes et suivi des invités en temps réel.',
  // ... (garde le reste de ton metadata)
}

interface RootLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params

  if (locale !== 'fr') {
    notFound()
  }

  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#F8FAFC] pb-16 md:pb-0 min-h-screen flex flex-col overflow-x-hidden">
        <Header />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition> {/* ⬅️ Nouveau */}
        </main>
        <Footer />
        <MobileNavigation />
      </body>
    </html>
  )
}