// lib/hcaptcha.ts
//
// Vérification serveur du token hCaptcha (défense en profondeur, en plus de
// la vérification déjà effectuée par Supabase Auth via son "Attack
// Protection"). Permet de rejeter/logger les échecs de captcha avant même
// d'appeler Supabase.
//
// ⚠️ Nécessite HCAPTCHA_SECRET_KEY (clé secrète, distincte de la site key
// publique NEXT_PUBLIC_HCAPTCHA_SITE_KEY) dans les variables d'environnement.

const HCAPTCHA_VERIFY_URL = 'https://hcaptcha.com/siteverify'

export async function verifyCaptcha(
  token: string | null | undefined,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  const secret = process.env.HCAPTCHA_SECRET_KEY

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      // Fail-closed : pas de clé secrète en prod = pas de garantie que le
      // token a réellement été validé, on refuse plutôt que de faire
      // semblant de protéger.
      console.error('[hcaptcha] HCAPTCHA_SECRET_KEY manquante en production — requêtes refusées.')
      return { success: false, error: 'captcha_not_configured' }
    }
    console.warn('[hcaptcha] HCAPTCHA_SECRET_KEY absente — vérification serveur ignorée (dev uniquement).')
    return { success: true }
  }

  if (!token) {
    return { success: false, error: 'missing_token' }
  }

  try {
    const params = new URLSearchParams({ secret, response: token })
    if (remoteIp) params.set('remoteip', remoteIp)

    const res = await fetch(HCAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const data = await res.json()
    if (!data.success) {
      return { success: false, error: Array.isArray(data['error-codes']) ? data['error-codes'].join(',') : 'verification_failed' }
    }
    return { success: true }
  } catch (err) {
    console.error('[hcaptcha] erreur réseau lors de la vérification:', err)
    return { success: false, error: 'network_error' }
  }
}
