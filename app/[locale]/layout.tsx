// app/[locale]/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { Header } from '@/components/layout/Header'
import { MobileNavigation } from '@/components/layout/MobileNavigation'
import { Footer } from '@/components/layout/Footer'
import { PageTransition } from '@/components/ui/PageTransition' // ⬅️ Nouveau
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

const SITE_URL = 'https://eventvivo.com'
const SITE_NAME = 'Eventvivo'
const DEFAULT_DESCRIPTION = 'Invitations numériques, RSVP, QR Codes et suivi des invités en temps réel. Du mariage au baptême — tout en un seul endroit.'
const DEFAULT_OG_IMAGE = '/images/interieur.webp'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Eventvivo - Organisez vos événements sans stress',
    template: '%s | Eventvivo',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ['invitation numérique', 'RSVP', 'QR code événement', 'gestion invités', 'mariage', 'événement Afrique', 'Eventvivo'],
  applicationName: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Eventvivo - Organisez vos événements sans stress',
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eventvivo - Organisez vos événements sans stress',
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1E3A8A',
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  description: DEFAULT_DESCRIPTION,
  sameAs: [],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'fr-FR',
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
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
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