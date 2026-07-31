import { useState, FormEvent, useRef, ChangeEvent, useEffect } from 'react';
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

interface ActiveOffer {
  _id: string;
  title: string;
}

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
  const [certificates, setCertificates] = useState<File[]>([]);

  // Offres d'emploi publiées (liées au module de gestion des offres)
  const [activeOffers, setActiveOffers] = useState<ActiveOffer[]>([]);
  const [offerId, setOfferId] = useState('');

  // Erreurs par champ (validation côté client + retours serveur)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const cvInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Charge les offres actives pour proposer les postes publiés
  useEffect(() => {
    fetch('/api/job-offers/active')
      .then((res) => (res.ok ? res.json() : []))
      .then(setActiveOffers)
      .catch(() => setActiveOffers([]));
  }, []);

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
      setFieldErrors((prev) => ({ ...prev, cv: '' }));
      setCvFile(file);
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

  const removeCertificate = (index: number) => {
    setCertificates(prev => prev.filter((_, i) => i !== index));
    if (certInputRef.current) certInputRef.current.value = '';
  };

  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  // Le téléphone doit contenir exactement 8 chiffres (uniquement des chiffres)
  const validatePhone = (value: string): boolean => {
    return /^\d{8}$/.test(value);
  };

  // Efface l'erreur d'un champ dès que l'utilisateur le corrige
  const clearFieldError = (key: string) => {
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: '' }));
  };

  // Filtre la saisie du téléphone : chiffres uniquement, 8 maximum
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    setPhone(digits);
    clearFieldError('phone');
  };

  // Validation complète de tous les champs avant envoi
  const validateForm = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!lastName.trim()) errs.lastName = 'Le nom est requis';
    if (!firstName.trim()) errs.firstName = 'Le prénom est requis';
    if (!email.trim()) errs.email = 'L\'adresse email est requise';
    else if (!validateEmail(email)) errs.email = 'Adresse email invalide (ex : nom@exemple.tn)';
    if (!phone.trim()) errs.phone = 'Le numéro de téléphone est requis';
    else if (!validatePhone(phone)) errs.phone = 'Le téléphone doit contenir 8 chiffres';
    if (!position) errs.position = 'Veuillez sélectionner un poste recherché';
    if (!experience) errs.experience = 'Veuillez sélectionner vos années d\'expérience';
    if (!education.trim()) errs.education = 'Le niveau d\'étude / la formation est requis';
    if (!cvFile) errs.cv = 'Le CV est obligatoire (PDF, DOC ou DOCX)';
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // 1. Validation locale de tous les champs
    const errs = validateForm();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setValidationError('Veuillez corriger les champs signalés ci-dessous.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('lastName', lastName.trim());
      formData.append('firstName', firstName.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      formData.append('position', position);
      formData.append('education', education.trim());
      formData.append('cv', cvFile!);
      if (experience) formData.append('experience', experience);
      if (address.trim()) formData.append('address', address.trim());
      if (motivationMessage.trim()) formData.append('motivationMessage', motivationMessage.trim());
      if (offerId) formData.append('jobOfferId', offerId);
      certificates.forEach(cert => formData.append('certificates', cert));

      const res = await fetch('/api/job-applications', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        // 2. Rétroaction des erreurs de validation serveur, champ par champ
        if (err?.errors && Array.isArray(err.errors)) {
          const serverErrs: Record<string, string> = {};
          err.errors.forEach((e: { param?: string; msg?: string }) => {
            const field = e.param;
            if (field && !serverErrs[field]) serverErrs[field] = e.msg || 'Champ invalide';
          });
          setFieldErrors(serverErrs);
          setValidationError('Veuillez corriger les champs signalés ci-dessous.');
        } else {
          setValidationError(err?.message || 'Erreur lors de l\'envoi de votre candidature');
        }
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setFieldErrors({});
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
    setOfferId('');
    setEducation('');
    setExperience('');
    setAddress('');
    setMotivationMessage('');
    setCvFile(null);
    setCertificates([]);
    setFieldErrors({});
    if (cvInputRef.current) cvInputRef.current.value = '';
    if (certInputRef.current) certInputRef.current.value = '';
    setIsSuccess(false);
  };

  // Classes réutilisables : bordure rouge si le champ est en erreur
  const inputClass = (hasError: boolean): string =>
    `w-full p-4 rounded-xl border bg-white text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900 ${
      hasError ? 'border-red-400' : 'border-gray-200'
    }`;

  const fieldError = (key: string) =>
    fieldErrors[key] ? <p className="text-xs text-red-500 mt-1">{fieldErrors[key]}</p> : null;

  // Note affichée devant chaque champ : Obligatoire ou Optionnel
  const FieldBadge = ({ required }: { required: boolean }) =>
    required ? (
      <span className="ml-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 align-middle">
        Obligatoire
      </span>
    ) : (
      <span className="ml-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 align-middle">
        Optionnel
      </span>
    );

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
            Rejoignez notre équipe
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
                        Nom <FieldBadge required />
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          clearFieldError('lastName');
                        }}
                        className={inputClass(!!fieldErrors.lastName)}
                        placeholder="Votre nom"
                      />
                      {fieldError('lastName')}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Prénom <FieldBadge required />
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          clearFieldError('firstName');
                        }}
                        className={inputClass(!!fieldErrors.firstName)}
                        placeholder="Votre prénom"
                      />
                      {fieldError('firstName')}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Email <FieldBadge required />
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearFieldError('email');
                        }}
                        className={inputClass(!!fieldErrors.email)}
                        placeholder="email@exemple.tn"
                      />
                      {fieldError('email')}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Téléphone <FieldBadge required />
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{8}"
                        maxLength={8}
                        value={phone}
                        onChange={handlePhoneChange}
                        className={inputClass(!!fieldErrors.phone)}
                        placeholder="8 chiffres (ex : 22123456)"
                      />
                      {fieldError('phone')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Poste recherché <FieldBadge required />
                      </label>
                      <select
                        value={position}
                        onChange={(e) => {
                          setPosition(e.target.value);
                          clearFieldError('position');
                          const offer = activeOffers.find((o) => o.title === e.target.value);
                          setOfferId(offer ? offer._id : '');
                        }}
                        className={`w-full p-4 rounded-xl border bg-white text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900 appearance-none ${
                          !!fieldErrors.position ? 'border-red-400' : 'border-gray-200'
                        }`}
                      >
                        <option value="">Choisir un poste</option>
                        {activeOffers.length > 0 && (
                          <optgroup label="Offres publiées">
                            {activeOffers.map((o) => (
                              <option key={o._id} value={o.title}>{o.title}</option>
                            ))}
                          </optgroup>
                        )}
                        <optgroup label="Candidature spontanée">
                          {POSITIONS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </optgroup>
                      </select>
                      {fieldError('position')}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Années d'expérience <FieldBadge required />
                      </label>
                      <select
                        value={experience}
                        onChange={(e) => {
                          setExperience(e.target.value);
                          clearFieldError('experience');
                        }}
                        className={`w-full p-4 rounded-xl border bg-white text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900 appearance-none ${
                          !!fieldErrors.experience ? 'border-red-400' : 'border-gray-200'
                        }`}
                      >
                        <option value="">Sélectionner</option>
                        {EXPERIENCE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {fieldError('experience')}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      Niveau d'étude / Formation <FieldBadge required />
                    </label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => {
                        setEducation(e.target.value);
                        clearFieldError('education');
                      }}
                      className={inputClass(!!fieldErrors.education)}
                      placeholder="Ex: Master en Comptabilité, IHEC..."
                    />
                    {fieldError('education')}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      Adresse <FieldBadge required={false} />
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={inputClass(false)}
                      placeholder="Votre adresse actuelle"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      CV (PDF, DOC, DOCX) <FieldBadge required />
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
                        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white hover:border-secondary/40 hover:bg-secondary/5 transition-all group ${
                          fieldErrors.cv ? 'border-red-400' : 'border-gray-300'
                        }`}
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
                    {fieldError('cv')}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      Certificats / Diplômes <FieldBadge required={false} />
                      <span className="ml-2 text-xs font-normal text-gray-400">(max 5 fichiers)</span>
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
                      Message de motivation <FieldBadge required={false} />
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
