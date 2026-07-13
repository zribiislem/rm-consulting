import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  TrendingUp,
  Settings,
  ShieldCheck,
  FileText,
  BarChart3,
  Users,
  Scale,
  Building2,
  ClipboardCheck,
  ShieldAlert,
  FileSpreadsheet,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { servicesData } from '../data';
import { Service } from '../types';

export default function ServicesCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');

  // Categories list
  const categories = ['Tous', 'Comptabilité', 'Audit', 'Conseil ISO', 'Juridique'];

  // Filter services
  const filteredServices = servicesData.filter(
    (s) => selectedCategory === 'Tous' || s.category === selectedCategory
  );

  // Map icon name to Lucide Component
  const renderIcon = (iconName: string) => {
    const props = { className: 'w-5 h-5 group-hover:scale-110 transition-transform duration-300 text-primary group-hover:text-white' };
    switch (iconName) {
      case 'payments':
        return <CreditCard {...props} />;
      case 'analytics':
        return <TrendingUp {...props} />;
      case 'settings_suggest':
        return <Settings {...props} />;
      case 'security':
        return <ShieldCheck {...props} />;
      case 'history_edu':
        return <FileText {...props} />;
      case 'monitoring':
        return <BarChart3 {...props} />;
      case 'diversity_3':
        return <Users {...props} />;
      case 'gavel':
        return <Scale {...props} />;
      case 'account_balance':
        return <Building2 {...props} />;
      case 'fact_check':
        return <ClipboardCheck {...props} />;
      case 'verified_user':
        return <ShieldAlert {...props} />;
      case 'description':
        return <FileSpreadsheet {...props} />;
      default:
        return <FileText {...props} />;
    }
  };

  return (
    <section id="services" className="py-20 sm:py-28 bg-surface-container-low scroll-mt-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Catalog Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6 text-left">
          <div>
            <span className="text-primary font-display font-bold tracking-widest text-xs uppercase block mb-3">
              Prestations et Solutions
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface">
              Catalogue des Services
            </h2>
            <p className="font-sans text-sm sm:text-base text-on-surface-variant mt-2 max-w-xl">
              Des solutions pointues, adaptées à la taille et au secteur d'activité de votre entreprise, pour chaque étape de votre développement.
            </p>
          </div>

          {/* Filtering buttons */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full font-sans text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-primary-fixed/30 hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Cards Grid with Motion layout animations */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-xl border border-secondary/10 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 shadow-sm text-left group flex flex-col justify-between"
              >
                <div>
                  {/* Icon wrapper */}
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low mb-4 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                    {renderIcon(service.iconName)}
                  </div>

                  {/* Category chip */}
                  <span className="text-[10px] uppercase font-bold text-secondary mb-1.5 block tracking-wider">
                    {service.category}
                  </span>

                  {/* Title */}
                  <h4 className="font-display font-bold text-gray-900 text-base mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h4>

                  {/* Description */}
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed mb-4">
                    {service.description}
                  </p>
                </div>

                {/* Sub-bullets displayed if present */}
                {service.subPoints && (
                  <div className="border-t border-gray-100 pt-3 mt-4">
                    <ul className="space-y-1.5">
                      {service.subPoints.map((pt, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[10px] text-gray-500 font-sans">
                          <CheckCircle2 className="w-3 h-3 text-secondary" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
