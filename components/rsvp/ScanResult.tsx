'use client'

import { CheckCircle, XCircle, AlertTriangle, Users, Clock } from 'lucide-react'

interface ScanResultProps {
  data: {
    recipientName: string
    numberOfGuests: number
    status: 'valid' | 'already_scanned' | 'not_confirmed' | 'invalid'
    scannedAt?: string
    rsvpStatus?: string
  }
}

export function ScanResult({ data }: ScanResultProps) {
  const { recipientName, numberOfGuests, status, scannedAt, rsvpStatus } = data

  const config = {
    valid: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      icon: <CheckCircle className="w-16 h-16 text-green-600" />,
      title: '✅ Validation réussie',
      message: 'L\'invité est présent et peut entrer.',
      textColor: 'text-green-700',
    },
    already_scanned: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      icon: <XCircle className="w-16 h-16 text-red-600" />,
      title: '⛔ Déjà scanné',
      message: `Ce QR Code a déjà été utilisé le ${scannedAt ? new Date(scannedAt).toLocaleString() : 'précédemment'}.`,
      textColor: 'text-red-700',
    },
    not_confirmed: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-500',
      icon: <AlertTriangle className="w-16 h-16 text-yellow-600" />,
      title: '⚠️ Invitation non confirmée',
      message: 'Cet invité n\'a pas encore confirmé sa présence.',
      textColor: 'text-yellow-700',
    },
    invalid: {
      bg: 'bg-gray-50',
      border: 'border-gray-500',
      icon: <AlertTriangle className="w-16 h-16 text-gray-600" />,
      title: '❓ Invitation invalide',
      message: 'Ce QR Code ne correspond à aucune invitation.',
      textColor: 'text-gray-700',
    },
  }

  const current = config[status] || config.invalid

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] p-4">
      <div className={`${current.bg} border-2 ${current.border} rounded-2xl shadow-xl p-8 max-w-md w-full`}>
        <div className="flex justify-center mb-4">
          {current.icon}
        </div>

        <h2 className={`text-2xl font-bold text-center ${current.textColor}`}>
          {current.title}
        </h2>

        <p className={`text-center mt-2 ${current.textColor}`}>
          {current.message}
        </p>

        {(status === 'valid' || status === 'already_scanned') && (
          <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#1E3A8A]" />
                <div>
                  <p className="text-sm text-gray-500">Invité</p>
                  <p className="font-semibold text-[#1E3A8A]">{recipientName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#F59E0B]" />
                <div>
                  <p className="text-sm text-gray-500">Accompagnateurs</p>
                  <p className="font-semibold text-[#1E3A8A]">{numberOfGuests}</p>
                </div>
              </div>

              {status === 'already_scanned' && scannedAt && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-500">Heure du premier scan</p>
                    <p className="font-semibold text-red-600">
                      {new Date(scannedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => window.location.reload()}
          className="mt-6 w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Scanner un autre QR Code
        </button>
      </div>
    </div>
  )
}