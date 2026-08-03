import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendReceiptEmailParams {
  to: string
  customerName: string
  eventName: string
  pdfBuffer: Buffer
  receiptNumber: string
}

export async function sendReceiptEmail({
  to,
  customerName,
  eventName,
  pdfBuffer,
  receiptNumber,
}: SendReceiptEmailParams) {
  try {
    const pdfBase64 = pdfBuffer.toString('base64')

    const { data, error } = await resend.emails.send({
        from: 'Eventvivo <contact@alaydetech.com>',
        replyTo: 'contact@alaydetech.com',
        to: [to],
        bcc: ['contact@alaydetech.com'],
        subject: `Votre reçu de paiement — Activation de votre événement - Eventvivo`,
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Inter', -apple-system, sans-serif; background-color: #FAFAF8; margin: 0; padding: 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAF8; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <tr>
                      <td align="center" style="padding-bottom: 20px;">
                        <h1 style="color: #1E3A8A; font-size: 28px; font-weight: 700; margin: 0; font-family: 'Poppins', sans-serif;">
                          Event<span style="color: #F59E0B;">vivo</span>
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 20px;">
                        <h2 style="color: #1E3A8A; font-size: 20px; font-weight: 600; margin: 0; font-family: 'Poppins', sans-serif;">
                            🎉 Paiement confirmé !
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 20px; color: #4B5563; font-size: 15px; line-height: 1.6;">
                        <p style="margin: 0 0 12px 0;">
                          Bonjour <strong style="color: #1E3A8A;">${customerName}</strong>,
                        </p>
                        <p style="margin: 0 0 12px 0;">
                          Nous vous confirmons que le paiement pour l'activation de votre événement 
                          <strong style="color: #1E3A8A;">« ${eventName} »</strong> a bien été reçu.
                        </p>
                        <p style="margin: 0 0 12px 0;">
                          🎉 Vos invitations sont désormais prêtes à être envoyées à vos invités.
                        </p>
                        <p style="margin: 0 0 12px 0;">
                          Vous trouverez ci-joint votre reçu officiel au format PDF.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom: 20px;">
                        <table width="100%" cellpadding="10" cellspacing="0" style="background-color: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB;">
                          <tr>
                            <td style="color: #6B7280; font-size: 13px;">N° de reçu</td>
                            <td style="color: #1E3A8A; font-size: 13px; font-weight: 600; text-align: right;">REC-${receiptNumber}</td>
                          </tr>
                          <tr>
                            <td style="color: #6B7280; font-size: 13px;">Date</td>
                            <td style="color: #1E3A8A; font-size: 13px; font-weight: 600; text-align: right;">${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 10px;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/fr/dashboard" style="display: inline-block; background-color: #1E3A8A; color: #FFFFFF; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600;">
                          Accéder à mon événement
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 30px; border-top: 1px solid #E5E7EB; text-align: center; color: #9CA3AF; font-size: 12px;">
                        <p style="margin: 0;">
                          ALAYDE TECH — Établissement immatriculé au RCCM sous le numéro RB/PNO/26 A 126770.
                        </p>
                        <p style="margin: 0;">
                          IFU : 0202238028015 — Porto-Novo, Bénin
                        </p>
                        <p style="margin: 10px 0 0 0;">
                          <a href="mailto:${process.env.RESEND_REPLY_TO || 'contact@alaydetech.com'}" style="color: #1E3A8A; text-decoration: underline;">${process.env.RESEND_REPLY_TO || 'contact@alaydetech.com'}</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: `reçu-${receiptNumber}.pdf`,
          content: pdfBase64,
          contentType: 'application/pdf',
        },
      ],
    })

    if (error) {
      console.error('Erreur envoi email:', error)
      throw new Error(`Erreur Resend: ${error.message}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Erreur envoi email:', error)
    throw error
  }
}