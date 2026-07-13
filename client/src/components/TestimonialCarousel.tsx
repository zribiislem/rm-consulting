import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonialsData } from '../data';

export default function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % testimonialsData.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length);
  };

  // Auto cycle testimonials
  useEffect(() => {
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, []);

  const current = testimonialsData[activeIndex];

  return (
    <section className="py-24 bg-primary text-white overflow-hidden relative border-b border-primary-container">
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        {/* Quote Icon decorative */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-block bg-primary-container p-4 rounded-full mb-6 border border-white/10"
        >
          <Quote className="w-8 h-8 text-secondary-fixed" />
        </motion.div>

        <h2 className="font-display text-2xl sm:text-3xl font-extrabold mb-12 text-white">
          Témoignages Clients
        </h2>

        {/* Carousel Slide Wrapper */}
        <div className="relative min-h-[220px] sm:min-h-[180px] flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl text-center"
            >
              <p className="font-sans text-base sm:text-lg lg:text-xl italic leading-relaxed text-white/95 mb-8">
                "{current.quote}"
              </p>

              {/* Author Info */}
              <div className="flex items-center justify-center gap-4 text-left">
                <div className="w-14 h-14 rounded-full border-2 border-secondary overflow-hidden shrink-0">
                  <img
                    src={current.imageUrl}
                    alt={current.author}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-white">{current.author}</h4>
                  <p className="text-secondary-fixed text-xs font-semibold uppercase tracking-wider">
                    {current.role}, <span className="font-bold">{current.company}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots & Navigation arrows */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full border border-white/20 hover:bg-white/10 text-white transition-all active:scale-90 cursor-pointer"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex justify-center gap-2">
            {testimonialsData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                  idx === activeIndex ? 'bg-secondary-fixed scale-125' : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-2 rounded-full border border-white/20 hover:bg-white/10 text-white transition-all active:scale-90 cursor-pointer"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Decorative blurry nodes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
    </section>
  );
}
