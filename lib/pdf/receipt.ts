import jsPDF from 'jspdf'

interface ReceiptData {
  number: string
  date: string
  customerName: string
  customerEmail: string
  eventId: string | null
  eventName?: string | null
  planName: string
  planPrice: number
  currency: string
  paymentMethod: string
  transactionId: string
}

export function generateReceiptPDF(data: ReceiptData): Buffer {
  const legalInfo = {
    rccm: 'RB/PNO/26 A 126770',
    ifu: '0202238028015',
    address: 'Porto-Novo, Bénin',
    supportEmail: 'contact@alaydetech.com',
  }

  const doc = new jsPDF()

  // === EN-TÊTE ===
  doc.setFontSize(20)
  doc.setTextColor('#1E3A8A')
  doc.text('ALAYDE TECH', 20, 20)

  doc.setFontSize(10)
  doc.setTextColor('#6B7280')
  doc.text(`Établissement individuel - Bénin`, 20, 28)
  doc.text(legalInfo.address, 20, 34)
  doc.text(`Email : ${legalInfo.supportEmail}`, 20, 40)

  // === REÇU ===
  doc.setFontSize(14)
  doc.setTextColor('#1E3A8A')
  doc.text('REÇU DE PAIEMENT', 20, 55)

  doc.setFontSize(10)
  doc.setTextColor('#111827')
  doc.text(`N° de reçu : REC-${data.number}`, 20, 65)
  doc.text(`Date : ${new Date(data.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`, 20, 72)
  doc.text(`Mode de paiement : ${data.paymentMethod}`, 20, 79)
  doc.text(`Référence : ${data.transactionId}`, 20, 86)

  // === CLIENT ===
  doc.setFontSize(12)
  doc.setTextColor('#1E3A8A')
  doc.text('CLIENT', 20, 100)

  doc.setFontSize(10)
  doc.setTextColor('#111827')
  doc.text(`Nom : ${data.customerName}`, 20, 110)
  doc.text(`Email : ${data.customerEmail}`, 20, 117)

  // === DÉTAIL DU SERVICE ===
  doc.setFontSize(12)
  doc.setTextColor('#1E3A8A')
  doc.text('DÉTAIL DU SERVICE', 20, 130)

  doc.setFontSize(10)
  doc.setTextColor('#111827')
  doc.text('Description', 20, 140)
  doc.text('Qté', 130, 140)
  doc.text('Prix', 160, 140)
  doc.line(20, 142, 190, 142)

  // La description peut être longue (ex: "Prestige — 500 invités, QR Codes,
  // Export Excel, PDF HD"). On la limite à la largeur disponible avant les
  // colonnes Qté/Prix (100mm) et on repositionne dynamiquement tout ce qui
  // suit selon le nombre de lignes réellement utilisées, pour ne jamais
  // chevaucher le texte peu importe la longueur du nom de plan.
  const descriptionLines: string[] = doc.splitTextToSize(data.planName, 100)
  doc.text(descriptionLines, 20, 150)
  doc.text('1', 130, 150)
  doc.text(`${data.planPrice} ${data.currency}`, 160, 150)

  const lineHeight = 6
  let cursorY = 150 + (descriptionLines.length - 1) * lineHeight

  // Événement concerné (si connu — absent pour un paiement dont
  // l'événement n'est pas encore créé au moment du reçu)
  if (data.eventName) {
    cursorY += 9
    doc.setFontSize(9)
    doc.setTextColor('#6B7280')
    doc.text(`Événement : ${data.eventName}`, 20, cursorY)
  }

  cursorY += 15
  doc.setFontSize(10)
  doc.setTextColor('#111827')
  doc.text('Total', 20, cursorY)
  doc.setFontSize(12)
  doc.setTextColor('#1E3A8A')
  doc.text(`${data.planPrice} ${data.currency}`, 160, cursorY)

  // === MENTION FISCALE === (position dynamique, dépend du contenu au-dessus)
  const legalY = cursorY + 20
  doc.setFontSize(8)
  doc.setTextColor('#6B7280')
  doc.text('Montant Net à payer. Exonéré de TVA (Article 219 ter du Code Général des Impôts - Régime de la TPS).', 20, legalY)

  // === PIED DE PAGE ===
  const footerY = legalY + 15
  doc.setFontSize(7)
  doc.setTextColor('#9CA3AF')
  doc.text(`ALAYDE TECH — Établissement immatriculé au RCCM sous le numéro ${legalInfo.rccm}.`, 20, footerY)
  doc.text(`IFU : ${legalInfo.ifu}. Siège social : ${legalInfo.address}, Bénin.`, 20, footerY + 7)
  doc.text('Reçu généré automatiquement. Ce document fait foi.', 20, footerY + 14)

  const pdfOutput = doc.output('arraybuffer')
  return Buffer.from(pdfOutput)
}

export function generateReceiptNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${year}${month}${day}-${random}`
}
