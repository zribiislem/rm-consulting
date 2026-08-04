import { motion } from 'motion/react';
import { Briefcase, ArrowLeft, ChevronDown } from 'lucide-react';

interface JoinUsHeroProps {
  /** Affiche le bouton "Voir plus" (utilisé sur la page d'accueil). */
  onViewMore?: () => void;
  /** Affiche une flèche retour en haut à gauche (utilisé sur la page de candidature). */
  backHref?: string;
}

export default function JoinUsHero({ onViewMore, backHref }: JoinUsHeroProps) {
  return (
    <section id="job-application" className="scroll-mt-12">
      <div className="relative py-20 md:py-24 overflow-hidden bg-primary">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/videos/join-us-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-burgundy-overlay opacity-85 z-0" />

        {backHref && (
          <motion.a
            href={backHref}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            title="Retour"
            aria-label="Retour"
            className="absolute top-5 left-5 md:top-7 md:left-7 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 text-white text-sm font-semibold hover:bg-white/25 active:scale-95 transition-all shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Retour</span>
          </motion.a>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 text-center">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ring-1 ring-white/10">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-6">
            Rejoignez notre équipe
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-sans">
            Chez RM Consulting, nous valorisons l'excellence, l'intégrité et
            l'innovation. Intégrez un cabinet de conseil de premier plan en
            Tunisie et participez à des projets d'audit et de conseil
            stratégiques.
          </p>
          {onViewMore && (
            <motion.button
              type="button"
              onClick={onViewMore}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 text-white font-semibold text-sm hover:bg-white/25 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              Voir plus
              <ChevronDown className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </section>
  );
}
