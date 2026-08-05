import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/auth/', '/dashboard/', '/events/checkout', '/events/choose-plan'],
    },
    sitemap: 'https://eventvivo.com/sitemap.xml',
  }
}