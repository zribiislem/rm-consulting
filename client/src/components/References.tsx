import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { clientReferences } from '../data';

export default function References() {
  const [selectedTag, setSelectedTag] = useState<string>('Tous');

  const tags = ['Tous', 'Banque', 'Industrie', 'Pharma', 'Tech', 'Agro'];

  const filteredRefs = clientReferences.filter(
    (item) => selectedTag === 'Tous' || item.category === selectedTag
  );

  return (
    <section id="references" className="py-20 sm:py-24 bg-surface-container-low border-y border-outline-variant/30 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-primary font-display font-bold tracking-widest text-xs uppercase block mb-3">
            Secteurs &amp; Références
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface mb-6">
            Ils Nous Font Confiance
          </h2>
          
          {/* Tag filters row */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {tags.map((tag) => {
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-secondary text-white border-secondary shadow-sm'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-secondary hover:text-secondary'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* References logos / text displays */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center"
        >
          <AnimatePresence mode="popLayout">
            {filteredRefs.map((item, idx) => (
              <motion.div
                key={item.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 0.75, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="h-16 flex flex-col items-center justify-center bg-white rounded-xl border border-secondary/10 p-3 shadow-sm grayscale hover:grayscale-0 transition-all duration-300 group relative cursor-pointer"
              >
                <span className="font-display font-extrabold text-sm sm:text-base text-primary/70 group-hover:text-primary tracking-widest transition-colors">
                  {item.name}
                </span>
                <span className="absolute bottom-1 text-[8px] font-bold text-gray-400 group-hover:text-secondary tracking-wider uppercase font-sans">
                  {item.category}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
