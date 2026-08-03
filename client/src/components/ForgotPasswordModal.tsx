import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, CheckCircle2, ArrowRight, ArrowLeft, KeyRound, Lock, AlertCircle, Loader2 } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [resetEmail, setResetEmail] = useState<string>('');
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email');
  const [code, setCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [infoMessage, setInfoMessage] = useState<string>('');

  const handleClose = () => {
    onClose();
    setStep('email');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage('');
    setInfoMessage('');
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!resetEmail || !resetEmail.includes('@')) {
      setErrorMessage('Veuillez saisir une adresse email valide.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim() }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setErrorMessage(data.message || 'Une erreur est survenue.');
        return;
      }

      setInfoMessage(data.message || 'Si cette adresse est associée à un compte, un code de réinitialisation a été envoyé.');
      setStep('code');
    } catch {
      setIsLoading(false);
      setErrorMessage('Erreur de connexion au serveur.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!code || code.trim().length !== 6) {
      setErrorMessage('Veuillez saisir le code de 6 chiffres reçu par email.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim(), code: code.trim(), newPassword }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setErrorMessage(data.message || 'Une erreur est survenue.');
        return;
      }

      setInfoMessage(data.message || 'Mot de passe réinitialisé avec succès.');
      setStep('done');
    } catch {
      setIsLoading(false);
      setErrorMessage('Erreur de connexion au serveur.');
    }
  };

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
              onClick={handleClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {errorMessage && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {infoMessage && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            {step === 'email' && (
              <form onSubmit={handleRequestCode} className="space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Saisissez l'adresse e-mail associée à votre compte d'administration. Un code de réinitialisation sécurisé vous sera envoyé par email.
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
                    onClick={handleClose}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6c0042] hover:bg-[#8b1e5a] shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <span>Envoyer le code</span>
                        <ArrowRight className="w-4 h-4 text-[#C8A96A]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 'code' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-[#6c0042] hover:bg-gray-100 transition-colors"
                    title="Retour"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Saisissez le code reçu par email, puis choisissez votre nouveau mot de passe (8 caractères minimum).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#554249] uppercase">
                    Code de réinitialisation
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm tracking-[0.5em] text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#6c0042] focus:border-[#6c0042]"
                    placeholder="••••••"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#554249] uppercase">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6c0042] focus:border-[#6c0042]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#554249] uppercase">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#6c0042] focus:border-[#6c0042]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6c0042] hover:bg-[#8b1e5a] shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Réinitialisation...</span>
                      </>
                    ) : (
                      <>
                        <span>Réinitialiser</span>
                        <ArrowRight className="w-4 h-4 text-[#C8A96A]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 'done' && (
              <div className="space-y-4">
                <div className="flex flex-col items-center text-center py-2">
                  <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#6c0042] hover:bg-[#8b1e5a] shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Se connecter</span>
                    <ArrowRight className="w-4 h-4 text-[#C8A96A]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
