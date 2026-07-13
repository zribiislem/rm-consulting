import { ArrowUp, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-primary text-white pt-16 pb-8 border-t border-primary-container relative">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 text-left mb-12">
        
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-base">
              RM
            </div>
            <span className="font-display font-bold text-xl text-white">RM Consulting</span>
          </div>
          <p className="font-sans text-xs sm:text-sm text-white/80 leading-relaxed">
            Cabinet d'excellence en audit, conseil et comptabilité de premier plan à Tunis. Partenaire de votre gouvernance et conformité financière depuis 2010.
          </p>
        </div>

        {/* Navigation Quick Links */}
        <div>
          <h4 className="font-display font-bold text-sm text-secondary-fixed uppercase tracking-wider mb-4">
            Navigation
          </h4>
          <ul className="space-y-2.5 font-sans text-xs sm:text-sm text-white/80">
            <li>
              <a href="#about" className="hover:text-secondary-fixed transition-colors">À propos</a>
            </li>
            <li>
              <a href="#departments" className="hover:text-secondary-fixed transition-colors">Départements</a>
            </li>
            <li>
              <a href="#services" className="hover:text-secondary-fixed transition-colors">Catalogue Services</a>
            </li>
            <li>
              <a href="#team" className="hover:text-secondary-fixed transition-colors">Notre Équipe</a>
            </li>
            <li>
              <a href="#contact" className="hover:text-secondary-fixed transition-colors">Prendre RDV</a>
            </li>
          </ul>
        </div>

        {/* Secteurs d'activité */}
        <div>
          <h4 className="font-display font-bold text-sm text-secondary-fixed uppercase tracking-wider mb-4">
            Expertises Clés
          </h4>
          <ul className="space-y-2.5 font-sans text-xs sm:text-sm text-white/80">
            <li>Commissariat aux comptes</li>
            <li>Conseil fiscal &amp; restructuration</li>
            <li>Certification ISO 9001/14001/27001</li>
            <li>Due diligence d'acquisition</li>
            <li>Secrétariat juridique du RNE</li>
          </ul>
        </div>

        {/* Direct contact column */}
        <div>
          <h4 className="font-display font-bold text-sm text-secondary-fixed uppercase tracking-wider mb-4">
            Bureaux de Tunis
          </h4>
          <ul className="space-y-3 font-sans text-xs sm:text-sm text-white/80">
            <li className="flex gap-2.5 items-start">
              <MapPin className="w-4 h-4 text-secondary-fixed shrink-0 mt-0.5" />
              <span>Les Berges du Lac 2, Tunis, Tunisie</span>
            </li>
            <li className="flex gap-2.5 items-center">
              <Phone className="w-4 h-4 text-secondary-fixed shrink-0" />
              <span>+216 71 000 000</span>
            </li>
            <li className="flex gap-2.5 items-center">
              <Mail className="w-4 h-4 text-secondary-fixed shrink-0" />
              <a href="mailto:contact@rm-consulting.tn" className="hover:underline">
                contact@rm-consulting.tn
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Under line credits & scroll to top */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-left">
          <p className="font-sans text-[11px] text-white/60">
            © {new Date().getFullYear()} RM Consulting Tunis. Tous droits réservés.
          </p>
          <p className="font-sans text-[10px] text-white/40 mt-1">
            Cabinet enregistré auprès de l'Ordre des Experts Comptables de Tunisie (OECT).
          </p>
        </div>

        <button
          onClick={handleScrollToTop}
          className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full text-white transition-all active:scale-95 cursor-pointer flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
          title="Retourner en haut de la page"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}
