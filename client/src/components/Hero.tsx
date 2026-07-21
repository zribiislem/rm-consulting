import { motion } from 'motion/react';
import { Sparkles, Calendar, Shield, PieChart, User } from 'lucide-react';
import { HERO_IMAGE } from '../data';

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
      <div className="relative z-20 max-w-7xl lg:max-w-[1360px] mx-auto pl-6 pr-6 lg:pr-2 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Typography & CTAs */}
        <div className="lg:col-span-7 text-white text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-secondary-fixed mb-6 border border-white/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-secondary-fixed animate-pulse" />
            Cabinet Certifié OECT Tunis
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
            RM Consulting accompagne les leaders d'aujourd'hui dans la maîtrise et la sécurisation de leurs enjeux comptables, fiscaux, d'audit et organisationnels avec une rigueur institutionnelle absolue.
          </motion.p>
        </div>

        {/* Right Side: Floating High-Value Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="lg:col-span-5 w-full font-sans flex justify-center lg:justify-end"
        >
          <div className="bg-white text-gray-900 p-5 sm:p-6 rounded-2xl relative shadow-2xl border border-gray-100 flex flex-col gap-4 sm:gap-5 max-w-md sm:max-w-[480px] w-full">
            
            {/* Main profile section: Photo & Title */}
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
              {/* Left: Beautiful Empty Photo Frame */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-2xl border-4 border-secondary/20 p-1 flex items-center justify-center bg-gray-50/50 shadow-inner relative group overflow-hidden">
                  {/* Thin golden ring inside */}
                  <div className="absolute inset-1.5 rounded-xl border border-secondary/30" />
                  
                  {/* Photo Silhouette Placeholder */}
                  <div className="w-full h-full rounded-xl bg-gray-100 flex flex-col items-center justify-center text-gray-400 group-hover:bg-gray-200 transition-colors duration-300">
                    <User className="w-10 h-10 mb-1 text-gray-400" />
                    <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500">Photo</span>
                  </div>
                </div>
              </div>

              {/* Right: Name & Title & Mini Logo */}
              <div className="flex-1">
                <div className="flex justify-between items-start gap-3">
                  <div className="text-left">
                    <h2 className="font-display font-extrabold text-xl sm:text-2xl text-primary leading-tight">
                      Mihoub Rezgui
                    </h2>
                    <p className="text-secondary font-medium text-xs sm:text-sm tracking-wide mt-0.5">
                      Expert-Comptable | Associé Gérant
                    </p>
                  </div>
                  
                  {/* Logo Representation */}
                  <div className="hidden sm:flex flex-col items-end border-l-2 border-secondary/30 pl-2.5 shrink-0">
                    <span className="font-display font-bold text-base text-primary leading-none tracking-tight">RM</span>
                    <span className="text-[6px] font-semibold text-secondary uppercase tracking-widest leading-none mt-0.5">Consulting</span>
                  </div>
                </div>
                
                {/* Short divider line */}
                <div className="w-12 h-0.5 bg-secondary rounded-full my-2.5 mx-auto sm:mx-0" />
                
                {/* Biography */}
                <p className="text-xs text-gray-600 leading-relaxed font-light text-left">
                  Depuis la création de <span className="font-semibold text-primary">RM CONSULTING</span> en 2017, M. Mihoub Rezgui met son expertise au service des entreprises en proposant des solutions adaptées en comptabilité, audit, fiscalité et accompagnement stratégique.
                </p>
              </div>
            </div>

            {/* Bottom: 3 Badge Grid Counters */}
            <div className="grid grid-cols-3 gap-2.5 border-t border-gray-100 pt-4">
              {/* Card 1 */}
              <div className="bg-gray-50/70 p-2 sm:p-2.5 rounded-xl border border-gray-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center mb-1">
                  <Calendar className="w-3.5 h-3.5 text-secondary" />
                </div>
                <div className="text-primary font-display font-extrabold text-sm sm:text-base leading-none">2017</div>
                <div className="text-[8px] text-gray-500 font-semibold uppercase tracking-wider mt-1">Fondation</div>
              </div>

              {/* Card 2 */}
              <div className="bg-gray-50/70 p-2 sm:p-2.5 rounded-xl border border-gray-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center mb-1">
                  <Shield className="w-3.5 h-3.5 text-secondary" />
                </div>
                <div className="text-primary font-display font-extrabold text-sm sm:text-base leading-none">OECT</div>
                <div className="text-[8px] text-gray-500 font-semibold uppercase tracking-wider mt-1">Membre</div>
              </div>

              {/* Card 3 */}
              <div className="bg-gray-50/70 p-2 sm:p-2.5 rounded-xl border border-gray-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center mb-1">
                  <PieChart className="w-3.5 h-3.5 text-secondary" />
                </div>
                <div className="text-primary font-display font-extrabold text-sm sm:text-base leading-none">4</div>
                <div className="text-[8px] text-gray-500 font-semibold uppercase tracking-wider mt-1">Pôles d'expertise</div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
