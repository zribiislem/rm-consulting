import { useState, FormEvent, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, AlertCircle, Upload, X, FileText, Briefcase, Award } from 'lucide-react';

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

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXT = '.pdf,.doc,.docx';
const MAX_SIZE = 15 * 1024 * 1024;

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
  const [certificates, setCertificates] = useState<File[]>([]);

  const cvInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Formats acceptés : PDF, DOC, DOCX uniquement';
    }
    if (file.size > MAX_SIZE) {
      return 'Le fichier ne doit pas dépasser 15 Mo';
    }
    return null;
  };

  const handleCvChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const err = validateFile(file);
      if (err) { setValidationError(err); return; }
      setValidationError('');
      setCvFile(file);
    }
  };

  const handleCoverLetterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const err = validateFile(file);
      if (err) { setValidationError(err); return; }
      setValidationError('');
      setCoverLetterFile(file);
    }
  };

  const handleCertificatesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const err = validateFile(files[i]);
        if (err) { setValidationError(err); return; }
        newFiles.push(files[i]);
      }
      if (certificates.length + newFiles.length > 5) {
        setValidationError('Maximum 5 certificats/diplômes autorisés');
        return;
      }
      setValidationError('');
      setCertificates(prev => [...prev, ...newFiles]);
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

  const removeCertificate = (index: number) => {
    setCertificates(prev => prev.filter((_, i) => i !== index));
    if (certInputRef.current) certInputRef.current.value = '';
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
    if (!cvFile) { setValidationError('Veuillez uploader votre CV (PDF, DOC ou DOCX)'); return; }

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
      certificates.forEach(cert => formData.append('certificates', cert));

      const res = await fetch('/api/job-applications', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        setValidationError(err.message || 'Erreur lors de l\'envoi de votre candidature');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch {
      setValidationError('Erreur lors de l\'envoi de votre candidature. Veuillez réessayer.');
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
    setCertificates([]);
    if (cvInputRef.current) cvInputRef.current.value = '';
    if (coverLetterInputRef.current) coverLetterInputRef.current.value = '';
    if (certInputRef.current) certInputRef.current.value = '';
    setIsSuccess(false);
  };

  return (
    <section id="job-application" className="scroll-mt-12">
      <div className="relative py-20 md:py-24 overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-10">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBUlhbTUetUI0FGkUYgxYNWAya0bi4BjXrdQHiObH6TTY8hQ0cXNY0hd3-DwVxE46cUieiY7t_4G3ywCzGq4qMXCw6Qg-zSDnsscZ7OYU82mnssGrMPJuKW0T03xyF1X0tTez7J0So6gZNjbWgY1rRtBtquwBjkyp4C_baZBe7eHKpZlQEbsA6c7qSi9TPo6dfHnioPhpVteiFmiv0DwquzZVjOU5EIS1np9yLbqSSiKSRMIve_Ob4F')",
            }}
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 text-center">
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ring-1 ring-white/10">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-6">
            Rejoignez notre équipe d'experts
          </h1>
          <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-sans">
            Chez RM Consulting, nous valorisons l'excellence, l'intégrité et
            l'innovation. Intégrez un cabinet de conseil de premier plan en
            Tunisie et participez à des projets d'audit et de conseil
            stratégiques.
          </p>
        </div>
      </div>

      <div className="py-16 md:py-20 bg-surface-container-low border-y border-outline-variant/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-10 shadow-xl border border-primary/10">
            <div className="mb-10 text-center">
              <span className="text-secondary font-display font-bold tracking-[0.2em] text-xs uppercase block mb-3">
                Recrutement
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-primary mt-2">
                Détails de votre profil
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-secondary/15 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-secondary" />
                  </div>
                  <h3 className="font-display text-2xl font-extrabold text-primary">
                    Candidature Reçue !
                  </h3>
                  <p className="text-on-surface-variant mt-2 font-sans">
                    Un email de confirmation vous a été envoyé. Nous reviendrons vers vous dans les plus brefs délais.
                  </p>
                  <button
                    onClick={resetForm}
                    className="mt-6 text-primary text-sm font-semibold border-b border-primary pb-0.5 hover:text-primary-container transition-colors cursor-pointer"
                  >
                    Déposer une autre candidature
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 md:space-y-8"
                  onSubmit={handleSubmit}
                >
                  {validationError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3 text-xs sm:text-sm">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Nom <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Prénom <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Email <span className="text-error">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                        placeholder="email@exemple.tn"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Téléphone <span className="text-error">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                        placeholder="+216 XX XXX XXX"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Poste recherché <span className="text-error">*</span>
                      </label>
                      <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900 appearance-none"
                      >
                        <option value="">Choisir un poste</option>
                        {POSITIONS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Années d'expérience
                      </label>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900 appearance-none"
                      >
                        <option value="">Sélectionner</option>
                        {EXPERIENCE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      Niveau d'étude / Formation <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                      placeholder="Ex: Master en Comptabilité, IHEC..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                      placeholder="Votre adresse actuelle"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        CV (PDF, DOC, DOCX) <span className="text-error">*</span>
                      </label>
                      {cvFile ? (
                        <div className="flex items-center justify-between border-2 border-secondary/30 rounded-xl px-4 py-4 bg-secondary/5">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-secondary" />
                            <span className="text-sm text-gray-700 truncate max-w-[180px] sm:max-w-[280px]">
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
                        <div
                          onClick={() => cvInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white hover:border-secondary/40 hover:bg-secondary/5 transition-all group"
                        >
                          <Upload className="w-8 h-8 text-gray-300 group-hover:text-secondary mb-2" />
                          <p className="text-sm text-gray-400 group-hover:text-gray-600 text-center">
                            Cliquez pour uploader votre CV (PDF, DOC, DOCX)
                          </p>
                        </div>
                      )}
                      <input
                        ref={cvInputRef}
                        type="file"
                        accept={ALLOWED_EXT}
                        onChange={handleCvChange}
                        className="hidden"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Lettre de motivation
                      </label>
                      {coverLetterFile ? (
                        <div className="flex items-center justify-between border-2 border-secondary/30 rounded-xl px-4 py-4 bg-secondary/5">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-secondary" />
                            <span className="text-sm text-gray-700 truncate max-w-[180px] sm:max-w-[280px]">
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
                        <div
                          onClick={() => coverLetterInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white hover:border-secondary/40 hover:bg-secondary/5 transition-all group"
                        >
                          <Upload className="w-8 h-8 text-gray-300 group-hover:text-secondary mb-2" />
                          <p className="text-sm text-gray-400 group-hover:text-gray-600 text-center">
                            Cliquez pour ajouter votre lettre de motivation
                          </p>
                        </div>
                      )}
                      <input
                        ref={coverLetterInputRef}
                        type="file"
                        accept={ALLOWED_EXT}
                        onChange={handleCoverLetterChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      Certificats / Diplômes (optionnel, max 5 fichiers)
                    </label>
                    {certificates.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {certificates.map((cert, idx) => (
                          <div key={idx} className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                            <div className="flex items-center gap-3">
                              <Award className="w-5 h-5 text-secondary" />
                              <span className="text-sm text-gray-700 truncate max-w-[200px] sm:max-w-[300px]">
                                {cert.name}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                ({Math.round(cert.size / 1024)} Ko)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCertificate(idx)}
                              className="p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div
                      onClick={() => certInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer bg-white hover:border-secondary/40 hover:bg-secondary/5 transition-all group"
                    >
                      <Upload className="w-5 h-5 text-gray-300 group-hover:text-secondary" />
                      <p className="text-sm text-gray-400 group-hover:text-gray-600">
                        {certificates.length > 0 ? 'Ajouter d\'autres fichiers' : 'Ajouter des certificats ou diplômes'}
                      </p>
                    </div>
                    <input
                      ref={certInputRef}
                      type="file"
                      accept={ALLOWED_EXT}
                      multiple
                      onChange={handleCertificatesChange}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      Message de motivation
                    </label>
                    <textarea
                      value={motivationMessage}
                      onChange={(e) => setMotivationMessage(e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                      placeholder="Dites-nous en plus sur vous..."
                      rows={4}
                    />
                  </div>

                  <div className="pt-2">
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
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
