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
}

module.exports = nextConfig