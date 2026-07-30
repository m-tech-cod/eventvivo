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
  },
  // ✅ FORCE LE VIDAGE DU CACHE À CHAQUE BUILD
    generateBuildId: async () => {
      return `build-${Date.now()}`
  },
}

module.exports = nextConfig