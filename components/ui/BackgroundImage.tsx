'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface BackgroundImageProps {
  src: string
  alt?: string
  children: ReactNode
  overlayOpacity?: number
  className?: string
  position?: 'center' | 'top' | 'bottom'
  animate?: 'none' | 'zoom' | 'parallax'
  /** LCP réel de la page uniquement — jamais true pour une image sous la ligne de flottaison (ex. un second BackgroundImage plus bas sur la même page). */
  priority?: boolean
  /** 75 par défaut (= défaut next/image, invisible avec l'overlay sombre appliqué par-dessus). Monter à 90 seulement si l'image est visible sans overlay marqué. */
  quality?: 75 | 90
}

export function BackgroundImage({
  src,
  alt = 'Background',
  children,
  overlayOpacity = 0.4,
  className = '',
  position = 'center',
  animate = 'none',
  priority = true,
  quality = 75,
}: BackgroundImageProps) {
  const positionClass = {
    center: 'object-center',
    top: 'object-top',
    bottom: 'object-bottom',
  }

  // ✅ Configuration des animations avec le bon type
  const getAnimationProps = () => {
    switch (animate) {
      case 'zoom':
        return {
          scale: [1, 1.08],
          transition: {
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse' as const,
            ease: 'easeInOut' as const,
          },
        }
      case 'parallax':
        return {
          y: [0, -20],
          transition: {
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse' as const,
            ease: 'easeInOut' as const,
          },
        }
      default:
        return {}
    }
  }

  const animationProps = getAnimationProps()

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* ✅ Image avec animation conditionnelle */}
      {animate === 'none' ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          className={`object-cover ${positionClass[position]}`}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          quality={quality}
        />
      ) : (
        <motion.div
          className="absolute inset-0"
          animate={animationProps}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className={`object-cover ${positionClass[position]}`}
            priority
            quality={90}
          />
        </motion.div>
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"
        style={{ opacity: overlayOpacity }}
      />

      {/* Contenu */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 flex flex-col"
      >
        {children}
      </motion.div>
    </div>
  )
}