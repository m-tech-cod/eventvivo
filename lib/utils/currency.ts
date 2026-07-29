export function getCurrencyByCountry(countryCode: string): 'XOF' | 'XAF' | 'EUR' | 'USD' {
  const currencyMap: Record<string, 'XOF' | 'XAF' | 'EUR' | 'USD'> = {
    // Afrique Francophone
    BJ: 'XOF',
    TG: 'XOF',
    CI: 'XOF',
    SN: 'XOF',
    BF: 'XOF',
    ML: 'XOF',
    GN: 'XOF',
    CM: 'XAF',
    GA: 'XAF',
    
    // Europe
    FR: 'EUR',
    BE: 'EUR',
    LU: 'EUR',
    CH: 'EUR',
    
    // Amérique du Nord
    US: 'USD',
    CA: 'USD',
  }
  
  return currencyMap[countryCode] || 'USD'
}

export function getPriceForCurrency(currency: string, planType?: string): number {
  // Prix par devise et par plan
  const prices: Record<string, Record<string, number>> = {
    free: { XOF: 0, XAF: 0, EUR: 0, USD: 0 },
    standard: { XOF: 2000, XAF: 2000, EUR: 9.99, USD: 9.99 },
    prestige: { XOF: 5000, XAF: 5000, EUR: 19.99, USD: 19.99 },
    vip: { XOF: 10000, XAF: 10000, EUR: 39.99, USD: 39.99 },
  }

  // Si planType est fourni, retourner le prix du plan
  if (planType && prices[planType]) {
    return prices[planType][currency] || 0
  }

  // Fallback pour compatibilité (ancien code)
  const legacyPrices: Record<string, number> = {
    XOF: 2000,
    XAF: 2000,
    EUR: 9.99,
    USD: 9.99,
  }
  return legacyPrices[currency] || 9.99
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    XOF: 'FCFA',
    XAF: 'FCFA',
    EUR: '€',
    USD: '$',
  }
  return symbols[currency] || currency
}

export function getPlanMaxGuests(planType: string): number {
  const maxGuests: Record<string, number> = {
    free: 10,
    standard: 100,
    prestige: 500,
    vip: 0, // 0 = illimité
  }
  return maxGuests[planType] || 10
}