export function generateTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

export function formatAmount(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  })
  return formatter.format(amount)
}