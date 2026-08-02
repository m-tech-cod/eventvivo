'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Send } from 'lucide-react'

interface FeedbackFormProps {
  onSubmit: (data: { type: string; rating?: number; content: string }) => void
  isLoading?: boolean
}

export function FeedbackForm({ onSubmit, isLoading = false }: FeedbackFormProps) {
  const [type, setType] = useState<'rating' | 'suggestion' | 'bug_report' | 'compliment'>('rating')
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [content, setContent] = useState('')

  const ratingMissing = type === 'rating' && rating === 0
  const canSubmit = content.trim().length > 0 && !ratingMissing

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({
      type,
      rating: type === 'rating' ? rating : undefined,
      content,
    })
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label className="text-[#1E3A8A]">Type de feedback</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { value: 'rating', label: '⭐ Note' },
            { value: 'suggestion', label: '💡 Suggestion' },
            { value: 'bug_report', label: '🐛 Problème' },
            { value: 'compliment', label: '❤️ Compliment' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={`p-2 rounded-lg border-2 text-sm transition-all ${
                type === option.value
                  ? 'border-[#1E3A8A] bg-[#1E3A8A]/5 shadow-sm'
                  : 'border-gray-200 hover:border-[#1E3A8A]/50 hover:bg-gray-50'
              }`}
              onClick={() => setType(option.value as any)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {type === 'rating' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <Label className="text-[#1E3A8A]">Votre note</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-3xl transition-all ${
                  star <= (hoverRating || rating)
                    ? 'text-[#F59E0B] scale-110'
                    : 'text-gray-300 hover:text-gray-400'
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </button>
            ))}
          </div>
          {ratingMissing && (
            <p className="text-xs text-red-500">Sélectionnez une note avant d'envoyer.</p>
          )}
        </motion.div>
      )}

      <div className="space-y-2">
        <Label htmlFor="content" className="text-[#1E3A8A]">Votre message</Label>
        <textarea
          id="content"
          rows={5}
          placeholder={
            type === 'rating'
              ? 'Que pensez-vous de Eventvivo ?'
              : type === 'suggestion'
              ? 'Avez-vous une idée pour améliorer Eventvivo ?'
              : type === 'bug_report'
              ? 'Décrivez le problème rencontré...'
              : 'Partagez votre expérience avec nous !'
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#1E3A8A] focus:ring-[#1E3A8A] transition-colors"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white transition-all"
        disabled={isLoading || !canSubmit}
      >
        <Send className="w-4 h-4 mr-2" />
        {isLoading ? 'Envoi...' : 'Envoyer le feedback'}
      </Button>
    </motion.form>
  )
}
