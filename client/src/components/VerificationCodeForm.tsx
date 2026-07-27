import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowRight, AlertCircle } from 'lucide-react';

interface VerificationCodeFormProps {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  errorMessage: string;
}

export const VerificationCodeForm: React.FC<VerificationCodeFormProps> = ({
  email,
  onVerify,
  onBack,
  isLoading,
  errorMessage,
}) => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = () => {
    const code = digits.join('');
    if (code.length === 6 && !isLoading) {
      onVerify(code);
    }
  };

  const isComplete = digits.every((d) => d !== '');

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md space-y-6 relative z-10"
    >
      <motion.div variants={itemVariants} className="text-center">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          className="relative inline-block mb-4 cursor-pointer"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-[#6c0042] via-[#C8A96A] to-[#8b1e5a] blur-md"
          />
          <div className="relative p-4 bg-gradient-to-br from-[#6c0042] to-[#8b1e5a] text-white rounded-2xl shadow-xl border border-[#C8A96A]/40 flex items-center justify-center">
            <Shield className="w-9 h-9 text-[#ffd8e6]" />
          </div>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#6c0042] font-display">
          Vérification
        </h2>
        <p className="text-sm sm:text-base text-[#554249] mt-1 font-medium">
          Code envoyé à <span className="text-[#6c0042] font-semibold">{email}</span>
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="glass-card p-6 sm:p-8 rounded-2xl space-y-6 border border-[#dac0c8]/50 shadow-2xl relative overflow-hidden backdrop-blur-xl bg-white/90"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6c0042] via-[#C8A96A] to-[#8b1e5a]" />

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="text-center space-y-2">
          <p className="text-sm text-[#554249]">
            Saisissez le code à 6 chiffres
          </p>

          <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none ${
                  digit
                    ? 'border-[#6c0042] bg-[#6c0042]/5 text-[#6c0042] shadow-sm'
                    : 'border-[#877179]/30 bg-white/80 text-gray-900'
                } focus:border-[#6c0042] focus:ring-2 focus:ring-[#6c0042]/30 disabled:opacity-50`}
              />
            ))}
          </div>
        </div>

        <div>
          <motion.button
            whileHover={isComplete && !isLoading ? { scale: 1.015, boxShadow: '0 12px 24px -6px rgba(108, 0, 66, 0.3)' } : {}}
            whileTap={isComplete && !isLoading ? { scale: 0.985 } : {}}
            onClick={handleSubmit}
            disabled={!isComplete || isLoading}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              isComplete && !isLoading
                ? 'bg-gradient-to-r from-[#6c0042] via-[#8b1e5a] to-[#6c0042] hover:opacity-95 shadow-[#6c0042]/25 cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2.5">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Vérification...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Vérifier</span>
                <ArrowRight className="w-4 h-4 text-[#C8A96A]" />
              </div>
            )}
          </motion.button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="text-sm text-[#6c0042] hover:text-[#8b1e5a] hover:underline font-medium transition-colors disabled:opacity-50"
          >
            ← Retour à la connexion
          </button>
        </div>
      </motion.div>

      <div className="text-center text-xs text-[#554249] space-y-1">
        <p className="font-medium">Accès restreint au personnel autorisé uniquement.</p>
        <p className="text-[11px] text-gray-400">
          Système d'information RM Consulting v3.4.2 • Support: admin@rm-consulting.com
        </p>
      </div>
    </motion.div>
  );
};
