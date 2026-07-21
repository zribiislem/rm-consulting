import { motion } from 'motion/react';
import { Shield, Brain, Star, Rocket } from 'lucide-react';
import { CONF_ROOM_IMAGE } from '../data';

export default function WhyChooseUs() {
  const points = [
    {
      title: 'Indépendance',
      desc: 'Une impartialité absolue dans l\'exercice de nos missions d\'audit, garantissant la pleine intégrité de nos conclusions et conseils.',
      icon: <Shield className="w-8 h-8 text-primary group-hover:text-white transition-all duration-300" />,
    },
    {
      title: 'Compétence Technique',
      desc: 'Des outils de travail conformes aux normes en vigueur, des actions de formation continue et un contrôle de qualité systématique par le gérant.',
      icon: <Brain className="w-8 h-8 text-primary group-hover:text-white transition-all duration-300" />,
    },
    {
      title: 'Supervision Directe',
      desc: 'La supervision des missions est assurée exclusivement par le gérant, garantissant une qualité irréprochable sur chaque dossier.',
      icon: <Star className="w-8 h-8 text-primary group-hover:text-white transition-all duration-300" />,
    },
    {
      title: 'Agrément BERD',
      desc: 'Cabinet agréé par la Banque Européenne de Restructuration et de Développement pour les projets internationaux de soutien aux PME.',
      icon: <Rocket className="w-8 h-8 text-primary group-hover:text-white transition-all duration-300" />,
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background with custom bordeaux gradient overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-primary/95 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container opacity-90 z-10" />
        <img
          src={CONF_ROOM_IMAGE}
          alt="RM Consulting Boardroom Meeting"
          className="w-full h-full object-cover bg-fixed bg-center scale-105"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6">
        {/* Header Block */}
        <div className="text-center mb-16 text-white">
          <span className="text-secondary-fixed font-display font-bold tracking-widest text-xs uppercase block mb-3">
            Nos Différenciateurs Clés
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold mb-4">
            Pourquoi Choisir RM Consulting ?
          </h2>
          <div className="w-16 h-1 bg-secondary-fixed mx-auto rounded-full mb-6" />
          <p className="opacity-90 max-w-2xl mx-auto font-sans text-sm sm:text-base font-light leading-relaxed">
            Plus qu'un simple cabinet d'expertise comptable, nous agissons en véritables gardiens de votre performance financière et de votre gouvernance.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {points.map((pt, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="glass-card p-8 rounded-2xl text-center group hover:bg-white transition-all duration-500 hover:shadow-2xl flex flex-col items-center"
            >
              {/* Icon Circle */}
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300 shadow-sm border border-secondary/15">
                {pt.icon}
              </div>

              {/* Title */}
              <h3 className="font-display font-bold text-lg text-primary group-hover:text-primary transition-colors mb-3">
                {pt.title}
              </h3>

              {/* Description */}
              <p className="text-on-surface-variant font-sans text-xs sm:text-sm leading-relaxed">
                {pt.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
