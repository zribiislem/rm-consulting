import { useState, FormEvent, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, AlertCircle, Upload, X, FileText } from 'lucide-react';

const POSITIONS = [
  'Stagiaire comptable',
  'Assistant comptable',
  'Collaborateur comptable',
  'Auditeur junior',
  'Auditeur confirmé',
  'Consultant',
  'Autre',
];

const EXPERIENCE_OPTIONS = [
  'Moins de 1 an',
  '1 - 2 ans',
  '3 - 5 ans',
  '5 - 10 ans',
  'Plus de 10 ans',
];

export default function JobApplication() {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [address, setAddress] = useState('');
  const [motivationMessage, setMotivationMessage] = useState('');

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

  const cvInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validatePDF = (file: File): boolean => {
    return file.type === 'application/pdf';
  };

  const handleCvChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validatePDF(file)) {
        setValidationError('Le CV doit être au format PDF');
        return;
      }
      setValidationError('');
      setCvFile(file);
    }
  };

  const handleCoverLetterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validatePDF(file)) {
        setValidationError('La lettre de motivation doit être au format PDF');
        return;
      }
      setValidationError('');
      setCoverLetterFile(file);
    }
  };

  const removeCv = () => {
    setCvFile(null);
    if (cvInputRef.current) cvInputRef.current.value = '';
  };

  const removeCoverLetter = () => {
    setCoverLetterFile(null);
    if (coverLetterInputRef.current) coverLetterInputRef.current.value = '';
  };

  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePhone = (value: string): boolean => {
    return /^[\d\s+\-().]{8,20}$/.test(value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!lastName.trim()) { setValidationError('Veuillez renseigner votre nom'); return; }
    if (!firstName.trim()) { setValidationError('Veuillez renseigner votre prénom'); return; }
    if (!email.trim() || !validateEmail(email)) { setValidationError('Veuillez renseigner une adresse email valide'); return; }
    if (!phone.trim() || !validatePhone(phone)) { setValidationError('Veuillez renseigner un numéro de téléphone valide'); return; }
    if (!position) { setValidationError('Veuillez sélectionner un poste recherché'); return; }
    if (!education.trim()) { setValidationError('Veuillez renseigner votre niveau d\'étude/formation'); return; }
    if (!cvFile) { setValidationError('Veuillez uploader votre CV (PDF)'); return; }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('lastName', lastName.trim());
      formData.append('firstName', firstName.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      formData.append('position', position);
      formData.append('education', education.trim());
      formData.append('cv', cvFile);
      if (experience) formData.append('experience', experience);
      if (address.trim()) formData.append('address', address.trim());
      if (coverLetterFile) formData.append('coverLetter', coverLetterFile);
      if (motivationMessage.trim()) formData.append('motivationMessage', motivationMessage.trim());

      const res = await fetch('/api/job-applications', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        setValidationError(err.message || 'Erreur lors de l\'envoi de la candidature');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch {
      setValidationError('Erreur lors de l\'envoi de la candidature. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setLastName('');
    setFirstName('');
    setEmail('');
    setPhone('');
    setPosition('');
    setEducation('');
    setExperience('');
    setAddress('');
    setMotivationMessage('');
    setCvFile(null);
    setCoverLetterFile(null);
    if (cvInputRef.current) cvInputRef.current.value = '';
    if (coverLetterInputRef.current) coverLetterInputRef.current.value = '';
    setIsSuccess(false);
  };

  return (
    <section id="job-application" className="py-20 sm:py-24 bg-surface-container-low border-y border-outline-variant/30 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left info column */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="relative bg-gradient-to-br from-primary/5 via-primary/[0.02] to-secondary/5 rounded-3xl p-8 border border-primary/10 shadow-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-primary/5">
                  <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                </div>

                <span className="text-primary font-display font-bold tracking-[0.2em] text-xs uppercase block mb-3">
                  Rejoignez Notre Équipe
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface mb-5 leading-tight">
                  Déposez votre <span className="text-primary">Candidature</span>
                </h2>
                <div className="w-12 h-1 bg-secondary rounded-full mb-5" />
                <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                  RM Consulting recrute des talents passionnés. Envoyez-nous votre candidature
                  et rejoignez un cabinet d'expertise comptable et d'audit en pleine croissance.
                </p>
              </div>
            </div>
          </div>

          {/* Right form column */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 relative overflow-hidden">
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white z-30 flex flex-col items-center justify-center p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-16 h-16 bg-secondary/15 rounded-full flex items-center justify-center text-secondary mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                  <h3 className="font-display font-extrabold text-primary text-2xl mb-3">
                    Candidature envoyée avec succès !
                  </h3>
                  <p className="font-sans text-on-surface-variant max-w-md mb-8 leading-relaxed">
                    Merci pour votre intérêt. Notre équipe RH étudiera votre dossier
                    et vous recontactera si votre profil correspond à nos besoins.
                  </p>
                  <button
                    onClick={resetForm}
                    className="bg-primary hover:bg-primary-container text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow active:scale-95 cursor-pointer"
                  >
                    Envoyer une autre candidature
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {validationError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Nom <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Prénom <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Email <span className="text-error">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Téléphone <span className="text-error">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                    placeholder="+216 XX XXX XXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Poste recherché <span className="text-error">*</span>
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                  >
                    <option value="">Sélectionnez un poste</option>
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Niveau d'étude / Formation <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                    placeholder="Ex: Master en comptabilité, Licence en finance..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Années d'expérience
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                  >
                    <option value="">Sélectionnez (optionnel)</option>
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                    placeholder="Votre adresse (optionnel)"
                  />
                </div>
              </div>

              {/* CV Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                  CV (PDF) <span className="text-error">*</span>
                </label>
                {cvFile ? (
                  <div className="flex items-center justify-between bg-secondary/5 border border-secondary/20 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-secondary" />
                      <span className="text-sm text-gray-700 truncate max-w-[200px] sm:max-w-[300px]">
                        {cvFile.name}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({Math.round(cvFile.size / 1024)} Ko)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCv}
                      className="p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => cvInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 text-center hover:border-secondary/40 hover:bg-secondary/5 transition-all cursor-pointer group"
                  >
                    <Upload className="w-6 h-6 text-gray-300 group-hover:text-secondary mx-auto mb-2" />
                    <p className="text-xs text-gray-400 group-hover:text-gray-600">
                      Cliquez pour uploader votre CV (PDF uniquement)
                    </p>
                  </button>
                )}
                <input
                  ref={cvInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleCvChange}
                  className="hidden"
                />
              </div>

              {/* Cover Letter Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                  Lettre de motivation (PDF)
                </label>
                {coverLetterFile ? (
                  <div className="flex items-center justify-between bg-secondary/5 border border-secondary/20 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-secondary" />
                      <span className="text-sm text-gray-700 truncate max-w-[200px] sm:max-w-[300px]">
                        {coverLetterFile.name}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({Math.round(coverLetterFile.size / 1024)} Ko)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoverLetter}
                      className="p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverLetterInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 text-center hover:border-secondary/40 hover:bg-secondary/5 transition-all cursor-pointer group"
                  >
                    <Upload className="w-6 h-6 text-gray-300 group-hover:text-secondary mx-auto mb-2" />
                    <p className="text-xs text-gray-400 group-hover:text-gray-600">
                      Cliquez pour ajouter votre lettre de motivation (optionnelle)
                    </p>
                  </button>
                )}
                <input
                  ref={coverLetterInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleCoverLetterChange}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                  Message de motivation
                </label>
                <textarea
                  value={motivationMessage}
                  onChange={(e) => setMotivationMessage(e.target.value)}
                  className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                  placeholder="Parlez-nous de vous, de vos motivations et de ce que vous pourriez apporter à RM Consulting..."
                  rows={4}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-container text-white py-4 rounded-xl font-bold hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer ma candidature
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
