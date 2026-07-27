import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Fingerprint, AlertCircle, KeyRound } from 'lucide-react';
import { VerificationCodeForm } from './VerificationCodeForm';

interface LoginFormProps {
  onOpenForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onOpenForgotPassword }) => {
  const [email, setEmail] = useState<string>('admin@rm-consulting.tn');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [step, setStep] = useState<'credentials' | 'verify' | 'success'>('credentials');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Veuillez saisir un identifiant email valide.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsLoading(false);
        setErrorMessage(data.message || 'Email ou mot de passe incorrect.');
        return;
      }

      setIsLoading(false);
      setPendingEmail(data.email || email.trim());
      setStep('verify');
    } catch {
      setIsLoading(false);
      setErrorMessage('Erreur de connexion au serveur.');
    }
  };

  const handleVerifyCode = async (code: string) => {
    setIsVerifying(true);
    setVerifyError('');

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIsVerifying(false);
        setVerifyError(data.message || 'Code invalide.');
        return;
      }

      localStorage.setItem('rm_admin_token', data.token);
      window.location.href = `http://localhost:3001/?token=${data.token}`;
    } catch {
      setIsVerifying(false);
      setVerifyError('Erreur de connexion au serveur.');
    }
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setVerifyError('');
    setErrorMessage('');
  };

  const handleBiometricLogin = () => {
    setIsLoading(true);
    setErrorMessage('');
    setTimeout(async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setIsLoading(false);
          setErrorMessage(data.message || 'Email ou mot de passe incorrect.');
          return;
        }
        setIsLoading(false);
        setPendingEmail(data.email || email.trim());
        setStep('verify');
      } catch {
        setIsLoading(false);
        setErrorMessage('Erreur de connexion au serveur.');
      }
    }, 1000);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-12 bg-[#f9f9f9] min-h-screen relative overflow-y-auto">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-0 right-0 w-80 h-80 bg-[#6c0042]/8 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, -20, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-0 left-0 w-80 h-80 bg-[#C8A96A]/15 rounded-full blur-3xl pointer-events-none"
      />

      {step === 'verify' ? (
        <VerificationCodeForm
          email={pendingEmail}
          onVerify={handleVerifyCode}
          onBack={handleBackToCredentials}
          isLoading={isVerifying}
          errorMessage={verifyError}
        />
      ) : (
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
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-[#6c0042] via-[#C8A96A] to-[#8b1e5a] blur-md"
              />

              <div className="relative p-4 bg-gradient-to-br from-[#6c0042] to-[#8b1e5a] text-white rounded-2xl shadow-xl border border-[#C8A96A]/40 flex items-center justify-center">
                <Shield className="w-9 h-9 text-[#ffd8e6]" />
              </div>
            </motion.div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#6c0042] font-display flex items-center justify-center gap-2">
              <span>RM Consulting</span>
              <Sparkles className="w-4 h-4 text-[#C8A96A] opacity-80" />
            </h2>
            <p className="text-sm sm:text-base text-[#554249] mt-1 font-medium">
              Portail d'Administration Interne
            </p>
          </motion.div>

          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="glass-card p-6 sm:p-8 rounded-2xl space-y-5 border border-[#dac0c8]/50 shadow-2xl relative overflow-hidden backdrop-blur-xl bg-white/90"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6c0042] via-[#C8A96A] to-[#8b1e5a]" />

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#554249] uppercase tracking-wider">
                Identifiant (Email)
              </label>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                  focusedInput === 'email' ? 'text-[#6c0042]' : 'text-gray-400 group-hover:text-gray-600'
                }`}>
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="admin@rm-consulting.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#877179]/30 bg-white/80 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#6c0042]/30 focus:border-[#6c0042] focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#554249] uppercase tracking-wider">
                  Mot de passe
                </label>
              </div>
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                  focusedInput === 'password' ? 'text-[#6c0042]' : 'text-gray-400 group-hover:text-gray-600'
                }`}>
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#877179]/30 bg-white/80 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#6c0042]/30 focus:border-[#6c0042] focus:bg-white transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#6c0042] transition-colors"
                  title={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#554249] hover:text-gray-900 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#6c0042] focus:ring-[#6c0042] transition-all cursor-pointer accent-[#6c0042]"
                />
                <span>Se souvenir de moi</span>
              </label>

              <button
                type="button"
                onClick={onOpenForgotPassword}
                className="font-semibold text-[#6c0042] hover:text-[#8b1e5a] hover:underline transition-colors flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3 text-[#735b24]" />
                <span>Oublié ?</span>
              </button>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.015, boxShadow: '0 12px 24px -6px rgba(108, 0, 66, 0.3)' }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={isLoading || isSuccess}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${
                  isSuccess
                    ? 'bg-emerald-700 shadow-emerald-800/30'
                    : 'bg-gradient-to-r from-[#6c0042] via-[#8b1e5a] to-[#6c0042] hover:opacity-95 shadow-[#6c0042]/25'
                }`}
              >
                {!isLoading && !isSuccess && (
                  <motion.div
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
                  />
                )}
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2.5"
                    >
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Authentification en cours...</span>
                    </motion.div>
                  ) : isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2 text-white font-bold"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      <span>Accès Autorisé ! Redirection...</span>
                    </motion.div>
                  ) : (
                    <motion.div key="default" className="flex items-center gap-2">
                      <span>Se connecter</span>
                      <ArrowRight className="w-4 h-4 text-[#C8A96A] group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <div className="pt-2 text-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleBiometricLogin}
                disabled={isLoading || isSuccess}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-gray-100 hover:bg-[#6c0042]/10 hover:text-[#6c0042] text-xs font-medium text-gray-700 transition-all border border-gray-200/80 shadow-sm"
                title="Connexion Biométrique empreinte / FaceID"
              >
                <Fingerprint className="w-4 h-4 text-[#735b24] animate-pulse" />
                <span>Connexion Biométrique (Touch ID / Face ID)</span>
              </motion.button>
            </div>
          </motion.form>

          <div className="text-center text-xs text-[#554249] space-y-1">
            <p className="font-medium">Accès restreint au personnel autorisé uniquement.</p>
            <p className="text-[11px] text-gray-400">
              Système d'information RM Consulting v3.4.2 • Support: admin@rm-consulting.com
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
