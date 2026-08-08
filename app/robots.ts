import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/fr/admin/',
        '/fr/auth/',
        '/fr/dashboard/',
        '/fr/events/checkout',
        '/fr/events/choose-plan',
      ],
    },
    sitemap: 'https://eventvivo.com/sitemap.xml',
  }
}