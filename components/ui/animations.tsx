'use client'

import { motion, Variants } from 'framer-motion'
import { ReactNode } from 'react'

// ✅ Définition correcte des variants avec le type Variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
}

// Bounce au survol (pas de variants ici, c'est un objet séparé)
export const bounceOnHover = {
  whileHover: { 
    scale: 1.03,
    transition: { duration: 0.2, type: 'spring', stiffness: 300 },
  },
  whileTap: { scale: 0.97 },
}

// Composant wrapper pour section animée
export function AnimatedSection({ 
  children, 
  className = '',
  delay = 0,
}: { 
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeInUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Composant wrapper pour bounce au survol
export function BounceOnHover({ 
  children, 
  className = '',
  onClick,
}: { 
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, transition: { duration: 0.2, type: 'spring', stiffness: 300 } }}
      whileTap={{ scale: 0.97 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// Composant wrapper pour les cartes (entrée en cascade)
export function StaggeredContainer({ 
  children, 
  className = '',
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.12,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}