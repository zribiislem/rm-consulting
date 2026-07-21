import { motion } from 'motion/react';
import { ShieldCheck, Star, Users, Briefcase, Sparkles } from 'lucide-react';
import { HERO_IMAGE, TEAM_COLLAGE_IMAGE } from '../data';

interface HeroProps {
  onBookConsultation: () => void;
  onExploreServices: () => void;
}

export default function Hero({ onBookConsultation, onExploreServices }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-burgundy-overlay z-10" />
        <img
          src={HERO_IMAGE}
          alt="Tunis Skyline at dusk"
          className="w-full h-full object-cover scale-105 animate-fade-in"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Typography & CTAs */}
        <div className="lg:col-span-7 text-white text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-secondary-fixed mb-6 border border-white/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-secondary-fixed animate-pulse" />
            Cabinet Agréé BERD — Membre OECT
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6"
          >
            Votre partenaire de confiance en{' '}
            <span className="text-secondary-fixed font-semibold">excellence financière</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-sans text-base sm:text-lg lg:text-xl opacity-90 max-w-xl mb-10 leading-relaxed font-light"
          >
            RM Consulting accompagne les entreprises tunisiennes et internationales dans la maîtrise et la sécurisation de leurs enjeux comptables, fiscaux, d'audit et organisationnels avec une rigueur institutionnelle absolue.
          </motion.p>
        </div>

        {/* Right Side: Floating High-Value Bento Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="lg:col-span-5 w-full"
        >
          <div className="glass-card p-6 sm:p-8 rounded-2xl relative overflow-hidden group">
            {/* Satisfaction badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-secondary/15 text-secondary border border-secondary/25 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> 98% de Satisfaction
              </span>
            </div>

            {/* Core branding and portrait */}
            <div className="mb-6 flex items-center gap-4 border-b border-secondary/10 pb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-secondary shadow-md shrink-0">
                <img
                  src={TEAM_COLLAGE_IMAGE}
                  alt="RM Consulting Experts"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left">
                <h3 className="font-display font-bold text-lg text-primary">L'Expertise RM</h3>
                <p className="text-on-surface-variant font-sans text-xs uppercase tracking-wider font-semibold">
                  Expertise Comptable, Audit &amp; Conseil
                </p>
              </div>
            </div>

            {/* Quick Pitch Description */}
              <p className="text-sm text-gray-700 leading-relaxed text-left mb-6">
                Société d'expertise comptable, d'audit et de conseils en gestion, membre de l'OECT. Agréée par la Banque Européenne de Restructuration et de Développement.
              </p>

            {/* Mini Dashboard Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 border-t border-secondary/10 pt-6">
              <div className="text-center">
                <div className="text-primary font-display font-extrabold text-xl sm:text-2xl">80</div>
                <div className="text-on-surface-variant text-[10px] font-medium tracking-wide uppercase mt-1">Clients Actifs</div>
              </div>
              <div className="text-center border-x border-secondary/10">
                <div className="text-primary font-display font-extrabold text-xl sm:text-2xl">14</div>
                <div className="text-on-surface-variant text-[10px] font-medium tracking-wide uppercase mt-1">Collaborateurs</div>
              </div>
              <div className="text-center">
                <div className="text-primary font-display font-extrabold text-xl sm:text-2xl">4</div>
                <div className="text-on-surface-variant text-[10px] font-medium tracking-wide uppercase mt-1">Départements</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
