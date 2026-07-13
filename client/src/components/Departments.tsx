import { motion } from 'motion/react';
import { Landmark, FileCheck, Scale, Layers } from 'lucide-react';
import { COMPTA_DEPT_IMAGE, AUDIT_DEPT_IMAGE, ABOUT_BOARD_IMAGE, ISO_DEPT_IMAGE } from '../data';

export default function Departments() {
  const departments = [
    {
      title: 'Département Expertise Comptable',
      description: 'Tenue et surveillance de votre comptabilité, reporting de gestion régulier, élaboration des états financiers et conformité complète de vos entités.',
      image: COMPTA_DEPT_IMAGE,
      icon: <Landmark className="w-6 h-6 text-primary" />,
      tagColor: 'bg-primary/10 text-primary border-primary/20',
      bulletIcon: 'bg-secondary',
      points: ['Tenue & Surveillance Comptable', 'États Financiers & Bilans Annuels', 'Déclarations Sociales & Fiscales'],
    },
    {
      title: 'Département Audit',
      description: 'Certification légale des comptes, commissariat aux comptes rigoureux, due diligence d’acquisition et diagnostics approfondis de contrôle interne.',
      image: AUDIT_DEPT_IMAGE,
      icon: <FileCheck className="w-6 h-6 text-secondary" />,
      tagColor: 'bg-secondary/10 text-secondary border-secondary/20',
      bulletIcon: 'bg-primary',
      points: ['Commissariat aux Comptes', 'Audit Financier & Contractuel', 'Audit d’Acquisition (Due Diligence)'],
    },
    {
      title: 'Département Taxe',
      description: 'Conseil fiscal permanent, audit fiscal de prévention, optimisation fiscale stratégique et assistance complète en cas de contrôle par l’administration.',
      image: ABOUT_BOARD_IMAGE,
      icon: <Scale className="w-6 h-6 text-primary" />,
      tagColor: 'bg-primary/10 text-primary border-primary/20',
      bulletIcon: 'bg-secondary',
      points: ['Optimisation Fiscale Légale', 'Assistance Contrôle Fiscal', 'Conseil Fiscal & Veille Permanente'],
    },
    {
      title: 'Département Consulting',
      description: 'Accompagnement méthodologique à la certification ISO, élaboration de business plans solides, restructuration d’entreprise et réingénierie des processus.',
      image: ISO_DEPT_IMAGE,
      icon: <Layers className="w-6 h-6 text-secondary" />,
      tagColor: 'bg-secondary/10 text-secondary border-secondary/20',
      bulletIcon: 'bg-primary',
      points: ['Accompagnement Normes ISO', 'Business Plans & Stratégie', 'Réingénierie des Processus'],
    },
  ];

  return (
    <section id="departments" className="py-20 sm:py-28 bg-white scroll-mt-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-secondary font-display font-bold tracking-widest text-xs uppercase block mb-3">
            Nos Métiers &amp; Compétences
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface mb-4">
            Nos Départements Spécialisés
          </h2>
          <div className="w-16 h-1 bg-secondary mx-auto rounded-full mb-6" />
          <p className="font-sans text-base text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            Nous structurons nos expertises en quatre pôles d’excellence autonomes et complémentaires pour répondre avec réactivité et technicité à tous vos défis de gestion.
          </p>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {departments.map((dept, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group flex flex-col h-full overflow-hidden rounded-2xl shadow-lg border border-outline-variant/30 hover:shadow-2xl transition-all duration-500 bg-surface"
            >
              {/* Card Image Header */}
              <div className="h-56 overflow-hidden relative shrink-0">
                <div
                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                  style={{ backgroundImage: `url(${dept.image})` }}
                />
                {/* Backdrop overlay */}
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/5 transition-colors duration-300" />
                
                {/* Icon Circle */}
                <div className="absolute bottom-4 left-4 bg-white p-3 rounded-xl shadow-md border border-gray-100 flex items-center justify-center">
                  {dept.icon}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 flex flex-col flex-grow text-left">
                <h3 className="font-display text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                  {dept.title}
                </h3>
                <p className="font-sans text-sm text-on-surface-variant mb-6 leading-relaxed flex-grow">
                  {dept.description}
                </p>

                {/* Bullets List */}
                <div className="border-t border-gray-100 pt-5 mt-auto">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-3">
                    Prestations clés :
                  </span>
                  <ul className="space-y-2">
                    {dept.points.map((point, ptIdx) => (
                      <li key={ptIdx} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className={`w-1.5 h-1.5 rounded-full ${dept.bulletIcon}`} />
                        <span className="font-sans font-medium">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
