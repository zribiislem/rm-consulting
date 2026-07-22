import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'motion/react';

interface Reference {
  _id: string;
  name: string;
  category: string;
  imageUrl?: string;
}

export default function References() {
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [singleSetWidth, setSingleSetWidth] = useState(0);

  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRefs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/references');
        if (res.ok) {
          const data = await res.json();
          setReferences(data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchRefs();
  }, []);

  const filteredRefs = references;

  useEffect(() => {
    if (trackRef.current) {
      setSingleSetWidth(trackRef.current.scrollWidth / 2);
    }
  }, [filteredRefs]);

  useAnimationFrame((_timestamp, delta) => {
    if (!isHovered && singleSetWidth > 0 && filteredRefs.length > 0) {
      const speed = 1 * (delta / 16.67);
      const currentX = x.get();
      if (currentX <= -singleSetWidth) {
        x.set(0);
      } else {
        x.set(currentX - speed);
      }
    }
  });

  const allItems = [...filteredRefs, ...filteredRefs];

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

        </div>

        {/* Carousel */}
        <div
          className="relative overflow-visible"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {loading ? (
            <div className="flex gap-6 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="min-w-[200px] h-28 bg-white rounded-xl border border-secondary/10 p-4 animate-pulse flex items-center justify-center shrink-0">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
              ))}
            </div>
          ) : filteredRefs.length === 0 ? (
            <div className="text-center py-12 text-sm text-on-surface-variant">
              Aucune référence dans cette catégorie
            </div>
          ) : (
            <motion.div
              ref={trackRef}
              style={{ x }}
              className="flex gap-6"
            >
              {allItems.map((item, index) => (
                <div
                  key={`${item._id}-${index}`}
                  className="min-w-[200px] h-28 flex items-center justify-center bg-white rounded-xl border border-secondary/10 p-6 shadow-sm hover:scale-110 hover:shadow-xl hover:shadow-secondary/20 hover:border-secondary transition-all duration-300 group shrink-0 cursor-pointer"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="max-h-full max-w-full w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <span className="font-display font-extrabold text-sm sm:text-base text-primary/60 group-hover:text-primary tracking-wider transition-all duration-300 text-center leading-tight group-hover:scale-110">
                      {item.name}
                    </span>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
