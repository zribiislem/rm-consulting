import React from 'react';
import { motion } from 'motion/react';
import { Lock, Award, Sparkles } from 'lucide-react';

export const LoginHeroSection: React.FC = () => {
  const particles = Array.from({ length: 8 });

  return (
    <div className="relative hidden md:flex md:w-1/2 lg:w-7/12 items-center justify-center bg-[#3d0023] overflow-hidden select-none min-h-screen">
      <motion.div
        initial={{ scale: 1.15, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#3d0023]/95 via-[#6c0042]/85 to-[#3a0b22]/90 backdrop-blur-[2px]" />

        {particles.map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.2, y: Math.random() * 400 }}
            animate={{
              opacity: [0.2, 0.7, 0.2],
              y: [0, -120, 0],
              x: [0, i % 2 === 0 ? 30 : -30, 0],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
            className="absolute rounded-full bg-[#C8A96A] blur-[1px]"
            style={{
              width: `${4 + (i % 3) * 3}px`,
              height: `${4 + (i % 3) * 3}px`,
              top: `${15 + i * 10}%`,
              left: `${10 + i * 11}%`,
            }}
          />
        ))}

        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.35, 0.55, 0.35],
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#C8A96A]/25 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.25, 0.45, 0.25],
            x: [0, -50, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-[#ff9fc8]/20 blur-3xl pointer-events-none"
        />
      </motion.div>

      <div className="relative z-10 p-8 lg:p-14 max-w-2xl text-white flex flex-col justify-between h-full py-12">
        <div className="my-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 text-[#C8A96A] font-semibold text-sm tracking-widest uppercase mb-4">
              <Sparkles className="w-4 h-4 text-[#C8A96A]" />
              <span>Excellence &amp; Rigueur Financière</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight font-display text-white">
              Expertise <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd8e6] via-[#C8A96A] to-white">&amp; Vision</span>
            </h1>
            <p className="text-white/80 text-base lg:text-lg max-w-lg leading-relaxed font-light">
              Plateforme interne de gestion, d'audit fiscal et de conseil stratégique pour dirigeants et partenaires financiers.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="pt-6 border-t border-white/15 flex items-center justify-between text-xs text-white/70"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#C8A96A]" />
            <span>Serveur Certifié SSL/TLS 256-Bit</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#ffd8e6]">
            <Award className="w-4 h-4 text-[#C8A96A]" />
            <span>RM Consulting © 2026</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
