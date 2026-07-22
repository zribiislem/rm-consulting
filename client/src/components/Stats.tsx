import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';

interface Stat {
  value: string;
  label: string;
}

function parseStatValue(value: string): { target: number; suffix: string } {
  const match = value.match(/^(\d+)(.*)$/);
  if (match) {
    return { target: parseInt(match[1], 10), suffix: match[2] };
  }
  return { target: 0, suffix: value };
}

function AnimatedCounter({ value, label, delay }: { value: string; label: string; delay: number }) {
  const { target, suffix } = parseStatValue(value);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: '-50px' });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!isInView) {
      setCount(0);
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const duration = 2000;
    let startTime: number | null = null;

    const timer = setTimeout(() => {
      const animate = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };
      rafRef.current = requestAnimationFrame(animate);
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isInView, target, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary mb-2">
        {count}{suffix}
      </div>
      <div className="text-on-surface-variant font-sans font-semibold text-xs sm:text-sm tracking-wider uppercase">
        {label}
      </div>
    </motion.div>
  );
}

export default function Stats() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/stats');
        if (!response.ok) throw new Error('Erreur');
        const data = await response.json();
        setStats(data);
      } catch {
        setStats([
          { value: '80+', label: 'Clients Actifs' },
          { value: '14', label: 'Experts & Collaborateurs' },
          { value: '4', label: 'Départements' },
          { value: '8+', label: "Années d'Expérience" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <section className="relative z-30 max-w-7xl mx-auto px-6 -mt-12">
        <div className="bg-white rounded-2xl shadow-xl border border-secondary/10 py-10 px-6 sm:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-20 mx-auto mb-2" />
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-30 max-w-7xl mx-auto px-6 -mt-12">
      <div className="bg-white rounded-2xl shadow-xl border border-secondary/10 py-10 px-6 sm:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <AnimatedCounter
              key={idx}
              value={stat.value}
              label={stat.label}
              delay={idx * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
