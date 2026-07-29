'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ScanResult } from '@/components/rsvp/ScanResult'
import { Loader2 } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection } from '@/components/ui/animations'

export default function ScanResultPage() {
  const params = useParams()
  const slug = params.slug as string
  const invitationId = params.invitationId as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchScanResult = async () => {
      try {
        const response = await fetch(`/api/rsvp/scan/${slug}/${invitationId}`)
        const result = await response.json()

        if (!response.ok) {
          setError(result.error || 'Erreur lors du scan')
          return
        }

        setData(result.data)
      } catch (err: any) {
        setError(err.message || 'Erreur réseau')
      } finally {
        setLoading(false)
      }
    }

    fetchScanResult()
  }, [slug, invitationId])

  if (loading) {
    return (
      <BackgroundImage src="/images/foule.webp" overlayOpacity={0.4} animate="zoom">
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Loader2 className="w-12 h-12 animate-spin text-white" />
          </motion.div>
        </div>
      </BackgroundImage>
    )
  }

  if (error) {
    return (
      <BackgroundImage src="/images/foule.webp" overlayOpacity={0.5} animate="zoom">
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-red-50/95 backdrop-blur-sm border-2 border-red-500 rounded-xl p-8 max-w-md w-full text-center"
          >
            <div className="text-5xl mb-4">⛔</div>
            <h2 className="text-xl font-bold text-red-700">Erreur</h2>
            <p className="text-red-600 mt-2">{error}</p>
          </motion.div>
        </div>
      </BackgroundImage>
    )
  }

  if (!data) {
    return (
      <BackgroundImage src="/images/foule.webp" overlayOpacity={0.35} animate="zoom">
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-100/95 backdrop-blur-sm border-2 border-gray-400 rounded-xl p-8 max-w-md w-full text-center"
          >
            <div className="text-5xl mb-4">❓</div>
            <h2 className="text-xl font-bold text-gray-700">Invitation introuvable</h2>
            <p className="text-gray-600 mt-2">Ce QR Code n'est pas valide.</p>
          </motion.div>
        </div>
      </BackgroundImage>
    )
  }

  return (
    <BackgroundImage src="/images/foule.webp" overlayOpacity={0.35} animate="zoom">
      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatedSection className="w-full max-w-md">
          <ScanResult data={data} />
        </AnimatedSection>
      </div>
    </BackgroundImage>
  )
}