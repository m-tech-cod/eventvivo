/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tjwihrslleanfwphlpex.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    qualities: [75, 90], // ✅ Déplacé ici
    formats: ['image/avif', 'image/webp'],
  },
  // Tree-shaking par icône/composant réellement importé — évite d'embarquer
  // des barrels entiers (lucide-react expose ~1000+ icônes, framer-motion
  // des dizaines de sous-modules) dans le bundle JS de chaque page.
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // ✅ FORCE LE VIDAGE DU CACHE À CHAQUE BUILD
    generateBuildId: async () => {
      return `build-${Date.now()}`
  },
}

module.exports = nextConfig