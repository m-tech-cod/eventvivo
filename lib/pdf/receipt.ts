import jsPDF from 'jspdf'

interface ReceiptData {
  number: string
  date: string
  customerName: string
  customerEmail: string
  eventId: string
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
    supportEmail: 'support@eventvivo.com',
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

  doc.text(data.planName, 20, 150)
  doc.text('1', 130, 150)
  doc.text(`${data.planPrice} ${data.currency}`, 160, 150)

  doc.text('Total', 20, 165)
  doc.setFontSize(12)
  doc.setTextColor('#1E3A8A')
  doc.text(`${data.planPrice} ${data.currency}`, 160, 165)

  // === MENTION FISCALE ===
  doc.setFontSize(8)
  doc.setTextColor('#6B7280')
  doc.text('Montant Net à payer. Exonéré de TVA (Article 219 ter du Code Général des Impôts - Régime de la TPS).', 20, 185)

  // === PIED DE PAGE ===
  doc.setFontSize(7)
  doc.setTextColor('#9CA3AF')
  doc.text(`ALAYDE TECH — Établissement immatriculé au RCCM sous le numéro ${legalInfo.rccm}.`, 20, 200)
  doc.text(`IFU : ${legalInfo.ifu}. Siège social : ${legalInfo.address}, Bénin.`, 20, 207)
  doc.text('Reçu généré automatiquement. Ce document fait foi.', 20, 214)

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