import { motion } from 'motion/react';

export default function Stats() {
  const stats = [
    { value: '80+', label: 'Clients Fidèles' },
    { value: '14+', label: 'Experts Seniors' },
    { value: '3', label: 'Départements Spécialisés' },
    { value: '15+', label: 'Années d’Expérience' },
  ];

  return (
    <section className="relative z-30 max-w-7xl mx-auto px-6 -mt-12">
      <div className="bg-white rounded-2xl shadow-xl border border-secondary/10 py-10 px-6 sm:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-on-surface-variant font-sans font-semibold text-xs sm:text-sm tracking-wider uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
