import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, MessageSquare, ArrowRight } from 'lucide-react';
import { faqData } from '../data';

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>('fq1');

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 bg-white scroll-mt-12 text-left">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side: Call to Action Help Block */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 self-start">
          <span className="text-secondary font-display font-bold tracking-widest text-xs uppercase block mb-3">
            Assistance &amp; Support
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface mb-4 leading-tight">
            Questions Fréquentes
          </h2>
          <p className="font-sans text-sm sm:text-base text-on-surface-variant mb-8 leading-relaxed">
            Trouvez les réponses clés concernant nos méthodologies de travail, nos étapes d'intégration, nos garanties de confidentialité et nos audits de certification.
          </p>

          <div className="p-6 bg-surface rounded-2xl border border-secondary/15 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="font-display font-bold text-primary text-base mb-2">
              Besoin de plus d'informations ?
            </h4>
            <p className="font-sans text-xs text-on-surface-variant mb-4 leading-relaxed">
              Nos experts-comptables associés se tiennent à votre entière disposition pour une consultation exploratoire gratuite et personnalisée.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-1 text-secondary hover:text-secondary-container font-bold text-xs uppercase tracking-wider hover:gap-3 transition-all"
            >
              Contactez-nous directement
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Right Side: Animated Accordions */}
        <div className="lg:col-span-8 space-y-4">
          {faqData.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'border-secondary/30 bg-white shadow-md'
                    : 'border-outline-variant/30 bg-surface hover:bg-white'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none cursor-pointer"
                >
                  <span className="font-display font-bold text-sm sm:text-base text-primary">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-secondary shrink-0 transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180 text-primary' : ''
                    }`}
                  />
                </button>

                {/* Animated Body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-on-surface-variant font-sans leading-relaxed border-t border-gray-100">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
