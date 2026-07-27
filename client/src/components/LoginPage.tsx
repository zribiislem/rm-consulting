import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { LoginHeroSection } from './LoginHeroSection';
import { LoginForm } from './LoginForm';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginPageProps {
  onBackToHome: () => void;
}

export default function LoginPage({ onBackToHome }: LoginPageProps) {
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] overflow-x-hidden font-sans select-none">
      {/* Back to site button */}
      <button
        onClick={onBackToHome}
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm border border-[#dac0c8]/50 text-[#6c0042] text-xs font-bold hover:bg-white hover:shadow-md transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au site
      </button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="min-h-screen flex flex-col md:flex-row overflow-hidden relative"
      >
        <LoginHeroSection />
        <LoginForm
          onOpenForgotPassword={() => setIsForgotPasswordOpen(true)}
        />
      </motion.div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}
