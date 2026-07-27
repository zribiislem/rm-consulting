import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [resetEmail, setResetEmail] = useState<string>('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#dac0c8] overflow-hidden relative"
        >
          <div className="bg-gradient-to-r from-[#6c0042] to-[#8b1e5a] text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 text-[#C8A96A]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base font-display">Réinitialisation</h3>
                <p className="text-xs text-white/70">Mot de passe oublié</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="space-y-4"
            >
              <p className="text-sm text-gray-600 leading-relaxed">
                Saisissez l'adresse e-mail associée à votre compte d'administration. Un lien de réinitialisation sécurisé vous sera envoyé immédiatement.
              </p>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#554249] uppercase">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6c0042] focus:border-[#6c0042]"
                    placeholder="admin@rm-consulting.com"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6c0042] hover:bg-[#8b1e5a] shadow-md transition-all flex items-center gap-2"
                >
                  <span>Envoyer le lien</span>
                  <ArrowRight className="w-4 h-4 text-[#C8A96A]" />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
