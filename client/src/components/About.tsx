import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Award, Users, Calendar, ArrowUpRight } from 'lucide-react';
import { ABOUT_PEN_IMAGE, ABOUT_BOARD_IMAGE, ABOUT_ATRIUM_IMAGE, timelineEvents } from '../data';

export default function About() {
  const [selectedTimelineYear, setSelectedTimelineYear] = useState('2010');

  const activeEvent = timelineEvents.find((e) => e.year === selectedTimelineYear) || timelineEvents[0];

  return (
    <section id="about" className="py-20 sm:py-28 bg-surface border-b border-outline-variant/20 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Block & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          
          {/* Left Side: Elegant 3-Image Mosaic Collage */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div
              className="h-56 sm:h-64 rounded-2xl bg-cover bg-center shadow-lg transform translate-y-4 hover:scale-[1.02] transition-transform duration-300 border border-secondary/10"
              style={{ backgroundImage: `url(${ABOUT_PEN_IMAGE})` }}
              title="Audit rigoureux et écritures de précision"
            />
            <div
              className="h-56 sm:h-64 rounded-2xl bg-cover bg-center shadow-lg hover:scale-[1.02] transition-transform duration-300 border border-secondary/10"
              style={{ backgroundImage: `url(${ABOUT_BOARD_IMAGE})` }}
              title="Cabinet de conseil et de prise de décision"
            />
            <div
              className="h-56 sm:h-64 rounded-2xl bg-cover bg-center shadow-lg col-span-2 hover:scale-[1.02] transition-transform duration-300 border border-secondary/10"
              style={{ backgroundImage: `url(${ABOUT_ATRIUM_IMAGE})` }}
              title="Collaborations professionnelles au sein du cabinet"
            />
          </div>

          {/* Right Side: Narrative */}
          <div className="lg:col-span-6 text-left">
            <span className="text-primary font-display font-bold tracking-widest text-xs uppercase block mb-3">
              À Propos de RM Consulting
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface mb-6 leading-tight">
              Une expertise au service de votre <span className="text-gradient-gold">croissance</span>
            </h2>
            <p className="font-sans text-base text-on-surface-variant mb-6 leading-relaxed">
              RM Consulting est une société d'expertise comptable, d'audit et de conseils en gestion, membre de l'Ordre des Experts Comptables de Tunisie (O.E.C.T), créée le 01/01/2017. La structure permanente, la compétence technique et l'expérience professionnelle du gérant et du personnel permettent d'offrir aux entreprises des services de qualité.
            </p>
            <p className="font-sans text-base text-on-surface-variant mb-8 leading-relaxed">
              RM Consulting est dotée des outils de travail les plus appropriés pour assurer un bon déroulement des missions conformément aux normes et réglementations en vigueur. La supervision des missions est assurée exclusivement par le gérant, et chaque dossier fait l'objet d'un contrôle de qualité. Le cabinet est agrée par la Banque Européenne de Restructuration et de Développement.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                'Expertise comptable, audit et conseil en gestion — Membre OECT',
                'Agrément BERD pour les projets internationaux de soutien aux PME',
                'Supervision exclusive par le gérant avec contrôle de qualité systématique',
              ].map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <span className="font-sans text-sm sm:text-base text-on-surface font-medium">
                    {point}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-bold text-sm hover:gap-3 transition-all uppercase tracking-wider"
            >
              Découvrir notre méthode de travail
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Timeline Component Header */}
        <div className="text-center mb-12">
          <h3 className="font-display text-2xl font-bold text-primary mb-2">Notre Trajectoire de Croissance</h3>
          <p className="text-sm text-on-surface-variant font-sans max-w-xl mx-auto">
            Sélectionnez une année clé pour découvrir comment nous avons façonné l'excellence de notre accompagnement financier.
          </p>
        </div>

        {/* Interactive Timeline Container */}
        <div className="relative bg-white border border-secondary/10 rounded-2xl p-6 sm:p-10 shadow-sm max-w-4xl mx-auto">
          {/* Horizontal Line and Years */}
          <div className="relative flex justify-between items-center mb-10 max-w-2xl mx-auto">
            {/* Horizontal Timeline Connector Bar */}
            <div className="absolute left-0 right-0 h-1 bg-gray-100 top-1/2 transform -translate-y-1/2 z-0" />
            
            {/* Active Highlight Bar */}
            <div className="absolute left-0 right-0 h-1 top-1/2 transform -translate-y-1/2 z-0">
              <div className="w-full h-full bg-gradient-to-r from-primary to-secondary opacity-20" />
            </div>

            {timelineEvents.map((evt) => {
              const isSelected = evt.year === selectedTimelineYear;
              return (
                <button
                  key={evt.year}
                  onClick={() => setSelectedTimelineYear(evt.year)}
                  className="relative z-10 focus:outline-none group cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-bold text-sm shadow-md transition-all ${
                      isSelected
                        ? 'bg-primary text-white scale-110 ring-4 ring-primary-fixed'
                        : 'bg-white text-gray-500 hover:text-primary hover:bg-primary-fixed/20 border border-gray-200'
                    }`}
                  >
                    {evt.year}
                  </div>
                  <span
                    className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                      isSelected ? 'text-primary' : 'text-gray-400 group-hover:text-primary'
                    }`}
                  >
                    {evt.title.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Event Description Display */}
          <div className="bg-surface rounded-xl p-6 border border-gray-100 text-left relative min-h-[140px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeEvent.year}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                  <span className="inline-block bg-secondary/15 text-secondary border border-secondary/25 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {activeEvent.year} — {activeEvent.title}
                  </span>
                  <span className="text-xs text-gray-400 font-sans sm:ml-auto uppercase tracking-widest font-semibold">
                    Étape Clé RM
                  </span>
                </div>
                <p className="font-sans text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  {activeEvent.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
