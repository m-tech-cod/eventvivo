'use client'

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#FAFAF8',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: 180,
    height: 250,
    margin: 10,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowBlur: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: 140,
    height: 100,
    objectFit: 'cover',
    borderRadius: 4,
    marginBottom: 10,
  },
  cardImagePlaceholder: {
    width: 140,
    height: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 30,
    color: '#9CA3AF',
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardType: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 2,
  },
  cardTime: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  cardBadge: {
    backgroundColor: '#F59E0B',
    color: '#1E3A8A',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    marginTop: 6,
  },
})

interface InvitationPDFProps {
  event: {
    name: string
    date: string
    time?: string
    location?: string
    description?: string
    cover_image?: string
    type: string
  }
  cardsPerPage: 1 | 4 | 10
}

export function InvitationPDF({ event, cardsPerPage }: InvitationPDFProps) {
  const totalCards = cardsPerPage
  const cards = Array(totalCards).fill(null)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {cards.map((_, index) => (
          <View key={index} style={styles.card}>
            {event.cover_image ? (
              <Image src={event.cover_image} style={styles.cardImage} />
            ) : (
              <View style={styles.cardImagePlaceholder}>
                <Text style={styles.placeholderText}>🎉</Text>
              </View>
            )}
            <Text style={styles.cardTitle}>{event.name}</Text>
            <Text style={styles.cardType}>
              {event.type === 'mariage' && '💍 Mariage'}
              {event.type === 'anniversaire' && '🎂 Anniversaire'}
              {event.type === 'bapteme' && '🕊️ Baptême'}
              {event.type === 'dots' && '💎 Dots'}
              {event.type === 'ceremonie' && '🎉 Cérémonie'}
              {event.type === 'autre' && '📌 Événement'}
            </Text>
            <Text style={styles.cardDate}>
              📅 {new Date(event.date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            {event.time && (
              <Text style={styles.cardTime}>⏰ {event.time}</Text>
            )}
            {event.location && (
              <Text style={styles.cardLocation}>📍 {event.location}</Text>
            )}
            <Text style={styles.cardBadge}>Eventvivo</Text>
          </View>
        ))}
      </Page>
    </Document>
  )
}