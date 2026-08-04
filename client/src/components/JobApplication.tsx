import { useState, FormEvent, useRef, ChangeEvent, useEffect, useCallback, type ReactNode, type RefObject, type Key } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  FileText,
  Briefcase,
  Award,
  MapPin,
  Building2,
  Link2,
  Users,
} from 'lucide-react';
import JoinUsHero from './JoinUsHero';
import { JobOffer, contractBadgeCls } from '../offers';

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

const AVAILABILITY_OPTIONS = [
  'Immédiate',
  'Sous 1 mois',
  'Sous 2 mois',
  'Sous 3 mois',
  'Négociable',
];

const SOURCE_OPTIONS = [
  'Site web RM Consulting',
  'LinkedIn',
  'Facebook',
  'Réseau de connaissances',
  'Salon / Forum emploi',
  'Cabinet de recrutement',
  'Autre',
];

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXT = '.pdf,.doc,.docx';
const MAX_SIZE = 15 * 1024 * 1024;

// Extrait l'identifiant d'offre depuis le hash : #/postuler?offer=<id> (ou ancien #job-application?offer=<id>)
const getOfferParam = (): string | null => {
  const hash = window.location.hash || '';
  if (!hash.startsWith('#/postuler?') && !hash.startsWith('#job-application?')) return null;
  const qIndex = hash.indexOf('?');
  if (qIndex === -1) return null;
  const params = new URLSearchParams(hash.slice(qIndex + 1));
  return params.get('offer');
};

export default function JobApplication() {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [nationality, setNationality] = useState('');
  const [city, setCity] = useState('');
  const [diploma, setDiploma] = useState('');
  const [lastPosition, setLastPosition] = useState('');
  const [availability, setAvailability] = useState('');
  const [motivationMessage, setMotivationMessage] = useState('');
  const [source, setSource] = useState('');

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [certificates, setCertificates] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);

  // Offres d'emploi publiées (liées au module de gestion des offres)
  const [activeOffers, setActiveOffers] = useState<JobOffer[]>([]);
  const [offerId, setOfferId] = useState('');

  // Offre pré-sélectionnée via le bouton "Postuler" (#job-application?offer=<id>)
  const [linkedOffer, setLinkedOffer] = useState<JobOffer | null>(null);
  const [linkedOfferLoading, setLinkedOfferLoading] = useState(false);

  // Erreurs par champ (validation côté client + retours serveur)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const cvInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

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

  // Lie le formulaire à l'offre sélectionnée via le bouton "Postuler"
  const applyOfferParam = useCallback((offerParam: string | null) => {
    if (!offerParam) {
      setLinkedOffer(null);
      setLinkedOfferLoading(false);
      return;
    }
    setLinkedOfferLoading(true);
    fetch(`/api/job-offers/public/${offerParam}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((offer: JobOffer | null) => {
        if (offer) {
          setLinkedOffer(offer);
          setPosition(offer.title);
          setOfferId(offer._id);
          setFieldErrors((prev) => ({ ...prev, position: '' }));
        } else {
          setLinkedOffer(null);
        }
      })
      .catch(() => setLinkedOffer(null))
      .finally(() => setLinkedOfferLoading(false));
  }, []);

  // Réagit aux changements de hash (clic sur "Postuler" depuis la page détail)
  useEffect(() => {
    const onHashChange = () => applyOfferParam(getOfferParam());
    applyOfferParam(getOfferParam());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [applyOfferParam]);

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

  const handleOtherFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const err = validateFile(files[i]);
        if (err) { setValidationError(err); return; }
        newFiles.push(files[i]);
      }
      if (otherFiles.length + newFiles.length > 5) {
        setValidationError('Maximum 5 autres documents autorisés');
        return;
      }
      setValidationError('');
      setOtherFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = <T,>(setter: (updater: (prev: T[]) => T[]) => void, inputRef: RefObject<HTMLInputElement | null>) => (index: number) => {
    setter((prev) => prev.filter((_, i) => i !== index));
    if (inputRef.current) inputRef.current.value = '';
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
    if (!linkedOffer && !position) errs.position = 'Veuillez sélectionner un poste recherché';
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
      if (city.trim()) formData.append('city', city.trim());
      if (dateOfBirth) formData.append('dateOfBirth', dateOfBirth);
      if (gender) formData.append('gender', gender);
      if (nationality.trim()) formData.append('nationality', nationality.trim());
      if (diploma.trim()) formData.append('diploma', diploma.trim());
      if (lastPosition.trim()) formData.append('lastPosition', lastPosition.trim());
      if (availability) formData.append('availability', availability);
      if (motivationMessage.trim()) formData.append('motivationMessage', motivationMessage.trim());
      if (source) formData.append('source', source);
      if (offerId) formData.append('jobOfferId', offerId);
      if (coverLetterFile) formData.append('coverLetter', coverLetterFile);
      certificates.forEach(cert => formData.append('certificates', cert));
      otherFiles.forEach(file => formData.append('otherFiles', file));

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
    setDateOfBirth('');
    setGender('');
    setNationality('');
    setCity('');
    setDiploma('');
    setLastPosition('');
    setAvailability('');
    setMotivationMessage('');
    setSource('');
    setCvFile(null);
    setCoverLetterFile(null);
    setCertificates([]);
    setOtherFiles([]);
    setFieldErrors({});
    if (cvInputRef.current) cvInputRef.current.value = '';
    if (coverLetterInputRef.current) coverLetterInputRef.current.value = '';
    if (certInputRef.current) certInputRef.current.value = '';
    if (otherInputRef.current) otherInputRef.current.value = '';
    // Détache l'offre liée (candidature spontanée)
    if (linkedOffer) {
      window.location.hash = '/postuler';
      setLinkedOffer(null);
    }
    setIsSuccess(false);
  };

  // Classes réutilisables : bordure rouge si le champ est en erreur
  const inputClass = (hasError: boolean): string =>
    `w-full p-4 rounded-xl border bg-white text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900 ${
      hasError ? 'border-red-400' : 'border-gray-200'
    }`;

  const selectClass = (hasError: boolean): string =>
    `w-full p-4 rounded-xl border bg-white text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900 appearance-none ${
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

  const SectionTitle = ({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) => (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-base font-extrabold text-primary">{title}</h3>
        <p className="text-xs text-on-surface-variant">{subtitle}</p>
      </div>
    </div>
  );

  // Zone de dépôt générique (fichiers multiples)
  const FileDropzone = ({
    icon,
    label,
    onClick,
    hint,
    hasError,
  }: {
    icon: ReactNode;
    label: string;
    onClick: () => void;
    hint: string;
    hasError?: boolean;
  }) => (
    <div
      onClick={onClick}
      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white hover:border-secondary/40 hover:bg-secondary/5 transition-all group ${
        hasError ? 'border-red-400' : 'border-gray-300'
      }`}
    >
      {icon}
      <p className="text-sm text-gray-400 group-hover:text-gray-600 text-center mt-2">{label}</p>
      <p className="text-[11px] text-gray-300 group-hover:text-gray-400 text-center">{hint}</p>
    </div>
  );

  // Élément fichier uploadé avec bouton de suppression
  const FileItem = ({
    file,
    icon,
    accent,
    onRemove,
  }: {
    file: File;
    icon: ReactNode;
    accent: string;
    onRemove: () => void;
    key?: Key;
  }) => (
    <div className={`flex items-center justify-between border-2 rounded-xl px-4 py-3 ${accent}`}>
      <div className="flex items-center gap-3 min-w-0">
        {icon}
        <span className="text-sm text-gray-700 truncate max-w-[200px] sm:max-w-[300px]">{file.name}</span>
        <span className="text-[10px] text-gray-400 shrink-0">({Math.round(file.size / 1024)} Ko)</span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
      >
        <X className="w-4 h-4 text-red-500" />
      </button>
    </div>
  );

  return (
    <>
      <JoinUsHero backHref="#" />

      <motion.div
        id="job-application-form"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="py-16 md:py-20 bg-surface-container-low border-y border-outline-variant/30 scroll-mt-20"
      >
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
                  <p className="text-on-surface-variant mt-2 font-sans max-w-md mx-auto">
                    {linkedOffer ? (
                      <>Votre candidature pour le poste de <strong className="text-primary">{linkedOffer.title}</strong> a bien été enregistrée.</>
                    ) : (
                      <>Votre candidature a bien été enregistrée.</>
                    )}{' '}
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
                  className="space-y-8 md:space-y-10"
                  onSubmit={handleSubmit}
                >
                  {validationError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3 text-xs sm:text-sm">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* Offre pré-sélectionnée (bouton "Postuler") */}
                  {linkedOfferLoading && (
                    <div className="p-5 bg-secondary/5 border border-secondary/20 rounded-xl flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-on-surface-variant">Chargement de l'offre...</p>
                    </div>
                  )}

                  {linkedOffer && !linkedOfferLoading && (
                    <div className="p-5 bg-primary/5 border-2 border-primary/20 rounded-2xl relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                            <Briefcase className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                              Vous postulez pour
                            </p>
                            <h3 className="font-display text-lg font-extrabold text-primary truncate">
                              {linkedOffer.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-on-surface-variant">
                              <span className="inline-flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5" /> {linkedOffer.department}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {linkedOffer.location}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${contractBadgeCls(linkedOffer.contractType)}`}>
                                {linkedOffer.contractType}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            window.location.hash = '/postuler';
                            setLinkedOffer(null);
                            setPosition('');
                            setOfferId('');
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Changer d'offre"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ============ INFORMATIONS PERSONNELLES ============ */}
                  <div className="space-y-6">
                    <SectionTitle
                      icon={<Users className="w-5 h-5" />}
                      title="Informations personnelles"
                      subtitle="Vos informations d'identité et de contact"
                    />
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
                          Date de naissance <FieldBadge required={false} />
                        </label>
                        <input
                          type="date"
                          value={dateOfBirth}
                          max={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className={inputClass(false)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                          Sexe <FieldBadge required={false} />
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className={selectClass(false)}
                        >
                          <option value="">Sélectionner</option>
                          <option value="Homme">Homme</option>
                          <option value="Femme">Femme</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                          Nationalité <FieldBadge required={false} />
                        </label>
                        <input
                          type="text"
                          value={nationality}
                          onChange={(e) => setNationality(e.target.value)}
                          className={inputClass(false)}
                          placeholder="Ex : Tunisienne"
                        />
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
                          Ville <FieldBadge required={false} />
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={inputClass(false)}
                          placeholder="Ex : Tunis"
                        />
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
                    </div>
                  </div>

                  {/* ============ INFORMATIONS PROFESSIONNELLES ============ */}
                  <div className="space-y-6 pt-2 border-t border-gray-100">
                    <SectionTitle
                      icon={<Award className="w-5 h-5" />}
                      title="Informations professionnelles"
                      subtitle="Votre parcours et votre disponibilité"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {linkedOffer ? (
                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700">
                            Poste recherché <FieldBadge required />
                          </label>
                          <div className="w-full p-4 rounded-xl border border-secondary/40 bg-secondary/5 flex items-center gap-2 text-sm text-gray-700 font-semibold">
                            <Link2 className="w-4 h-4 text-secondary shrink-0" />
                            {linkedOffer.title}
                            <span className="ml-auto text-[10px] font-bold text-secondary px-2 py-0.5 rounded-full bg-secondary/10">
                              Offre sélectionnée
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 md:col-span-2">
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
                            className={selectClass(!!fieldErrors.position)}
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
                      )}

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
                          Diplôme <FieldBadge required={false} />
                        </label>
                        <input
                          type="text"
                          value={diploma}
                          onChange={(e) => setDiploma(e.target.value)}
                          className={inputClass(false)}
                          placeholder="Ex : Master en expertise comptable"
                        />
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
                          className={selectClass(!!fieldErrors.experience)}
                        >
                          <option value="">Sélectionner</option>
                          {EXPERIENCE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        {fieldError('experience')}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                          Dernier poste occupé <FieldBadge required={false} />
                        </label>
                        <input
                          type="text"
                          value={lastPosition}
                          onChange={(e) => setLastPosition(e.target.value)}
                          className={inputClass(false)}
                          placeholder="Ex : Assistant comptable"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                          Disponibilité <FieldBadge required={false} />
                        </label>
                        <select
                          value={availability}
                          onChange={(e) => setAvailability(e.target.value)}
                          className={selectClass(false)}
                        >
                          <option value="">Sélectionner</option>
                          {AVAILABILITY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* ============ DOCUMENTS ============ */}
                  <div className="space-y-6 pt-2 border-t border-gray-100">
                    <SectionTitle
                      icon={<FileText className="w-5 h-5" />}
                      title="Documents"
                      subtitle="CV, lettre de motivation, diplômes et autres justificatifs"
                    />

                    {/* CV */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        CV (PDF, DOC, DOCX) <FieldBadge required />
                      </label>
                      {cvFile ? (
                        <FileItem file={cvFile} icon={<FileText className="w-5 h-5 text-secondary" />} accent="border-secondary/30 bg-secondary/5" onRemove={removeCv} />
                      ) : (
                        <FileDropzone
                          icon={<Upload className="w-8 h-8 text-gray-300 group-hover:text-secondary mb-2" />}
                          label="Cliquez pour uploader votre CV"
                          hint="PDF, DOC, DOCX — 15 Mo maximum"
                          onClick={() => cvInputRef.current?.click()}
                          hasError={!!fieldErrors.cv}
                        />
                      )}
                      <input ref={cvInputRef} type="file" accept={ALLOWED_EXT} onChange={handleCvChange} className="hidden" />
                      {fieldError('cv')}
                    </div>

                    {/* Lettre de motivation */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Lettre de motivation <FieldBadge required={false} />
                      </label>
                      {coverLetterFile ? (
                        <FileItem file={coverLetterFile} icon={<FileText className="w-5 h-5 text-primary" />} accent="border-primary/30 bg-primary/5" onRemove={removeCoverLetter} />
                      ) : (
                        <FileDropzone
                          icon={<FileText className="w-8 h-8 text-gray-300 group-hover:text-primary mb-2" />}
                          label="Cliquez pour uploader votre lettre de motivation"
                          hint="PDF, DOC, DOCX — facultative"
                          onClick={() => coverLetterInputRef.current?.click()}
                        />
                      )}
                      <input ref={coverLetterInputRef} type="file" accept={ALLOWED_EXT} onChange={handleCoverLetterChange} className="hidden" />
                    </div>

                    {/* Diplômes / Certificats */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Diplômes &amp; Certificats <FieldBadge required={false} />
                        <span className="ml-2 text-xs font-normal text-gray-400">(max 5 fichiers)</span>
                      </label>
                      {certificates.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {certificates.map((cert, idx) => (
                            <FileItem
                              key={idx}
                              file={cert}
                              icon={<Award className="w-5 h-5 text-secondary" />}
                              accent="border-gray-200 bg-gray-50"
                              onRemove={() => removeFile(setCertificates, certInputRef)(idx)}
                            />
                          ))}
                        </div>
                      )}
                      <FileDropzone
                        icon={<Award className="w-5 h-5 text-gray-300 group-hover:text-secondary" />}
                        label={certificates.length > 0 ? 'Ajouter d\'autres fichiers' : 'Ajouter des certificats ou diplômes'}
                        hint="PDF, DOC, DOCX — 15 Mo par fichier"
                        onClick={() => certInputRef.current?.click()}
                      />
                      <input ref={certInputRef} type="file" accept={ALLOWED_EXT} multiple onChange={handleCertificatesChange} className="hidden" />
                    </div>

                    {/* Autres documents */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Autres documents <FieldBadge required={false} />
                        <span className="ml-2 text-xs font-normal text-gray-400">(max 5 fichiers — lettres de recommandation, attestations...)</span>
                      </label>
                      {otherFiles.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {otherFiles.map((file, idx) => (
                            <FileItem
                              key={idx}
                              file={file}
                              icon={<FileText className="w-5 h-5 text-primary" />}
                              accent="border-gray-200 bg-gray-50"
                              onRemove={() => removeFile(setOtherFiles, otherInputRef)(idx)}
                            />
                          ))}
                        </div>
                      )}
                      <FileDropzone
                        icon={<FileText className="w-5 h-5 text-gray-300 group-hover:text-primary" />}
                        label={otherFiles.length > 0 ? 'Ajouter d\'autres documents' : 'Ajouter d\'autres documents'}
                        hint="PDF, DOC, DOCX — 15 Mo par fichier"
                        onClick={() => otherInputRef.current?.click()}
                      />
                      <input ref={otherInputRef} type="file" accept={ALLOWED_EXT} multiple onChange={handleOtherFilesChange} className="hidden" />
                    </div>
                  </div>

                  {/* ============ INFORMATIONS COMPLÉMENTAIRES ============ */}
                  <div className="space-y-6 pt-2 border-t border-gray-100">
                    <SectionTitle
                      icon={<Link2 className="w-5 h-5" />}
                      title="Informations complémentaires"
                      subtitle="Parlez-nous de votre motivation"
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Pourquoi souhaitez-vous rejoindre RM CONSULTING ? <FieldBadge required={false} />
                      </label>
                      <textarea
                        value={motivationMessage}
                        onChange={(e) => setMotivationMessage(e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                        placeholder="Dites-nous ce qui vous attire dans notre cabinet..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Comment avez-vous connu notre cabinet ? <FieldBadge required={false} />
                      </label>
                      <select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className={selectClass(false)}
                      >
                        <option value="">Sélectionner</option>
                        {SOURCE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
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
      </motion.div>
    </>
  );
}
