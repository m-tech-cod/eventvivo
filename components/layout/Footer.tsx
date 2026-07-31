import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <span className="text-[#1E3A8A] font-bold text-xl font-poppins">Event</span>
              <span className="text-[#F59E0B] font-bold text-xl font-poppins">vivo</span>
            </div>
            <p className="text-sm text-gray-500">
              Simplifiez la gestion de vos événements
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-[#1E3A8A] mb-3">Produit</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/fr/pricing" className="hover:text-[#1E3A8A]">Tarifs</Link></li>
              <li><Link href="/fr/faq" className="hover:text-[#1E3A8A]">FAQ</Link></li>
              <li><Link href="/fr/feedback" className="hover:text-[#1E3A8A]">Donner mon avis</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-[#1E3A8A] mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/fr/contact" className="hover:text-[#1E3A8A]">Nous contacter</Link></li>
              <li><Link href="/fr/support" className="hover:text-[#1E3A8A]">Support</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-[#1E3A8A] mb-3">Légal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/fr/terms" className="hover:text-[#1E3A8A]">Conditions</Link></li>
              <li><Link href="/fr/privacy" className="hover:text-[#1E3A8A]">Confidentialité</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-4">
          <p className="text-xs text-gray-400 text-center select-none">
            Eventvivo est un service édité par l'Établissement{' '}
            <strong className="font-medium text-gray-500">ALAYDE TECH</strong>, 
            immatriculé au RCCM du Bénin sous le numéro{' '}
            <strong className="font-medium text-gray-500">RB/PNO/26 A 126770</strong>.
          </p>

          <a href="mailto:contact@alaydetech.com" style={{ color: '#1E3A8A', textDecoration: 'underline' }}>
            contact@alaydetech.com
          </a>
        </div>
        
        <div className="border-t border-gray-200 mt-4 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © 2026 Eventvivo. Conçu et développé par{' '}
            <a
              href="https://alaydetech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-500 hover:text-[#1E3A8A] transition-colors"
            >
              ALAYDE TECH
            </a>
          </p>
          <div className="flex gap-4 text-gray-400">
            <a href="https://www.facebook.com/share/14mmCKwD6xc/?mibextid=wwXIfr" className="hover:text-[#1E3A8A] text-sm">Facebook</a>
            <a href="https://www.tiktok.com/@eventvivo?_r=1&_t=ZS-97qF2IxheDf" className="hover:text-[#1E3A8A] text-sm">TikTok</a>
            <a href="https://wa.me/2290157562911" className="hover:text-[#1E3A8A] text-sm">WhatsApp</a>
          </div>
        </div>
      </div>
    </footer>
  )
}