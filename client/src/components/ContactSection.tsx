import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Calendar, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactSection() {
  const [activeTab, setActiveTab] = useState<'message' | 'rdv'>('message');

  useEffect(() => {
    const handleSetTab = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === 'message' || customEvent.detail === 'rdv') {
        setActiveTab(customEvent.detail);
        setValidationError('');
      }
    };
    window.addEventListener('set-contact-tab', handleSetTab);
    return () => window.removeEventListener('set-contact-tab', handleSetTab);
  }, []);
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // RDV specific states
  const [rdvDate, setRdvDate] = useState('');
  const [rdvTime, setRdvTime] = useState('Matin (09:00 - 12:00)');
  
  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Basic validation
    if (!fullName.trim()) {
      setValidationError('Veuillez renseigner votre nom complet.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Veuillez renseigner une adresse email valide.');
      return;
    }
    if (activeTab === 'message' && !message.trim()) {
      setValidationError('Veuillez rédiger un court message explicatif.');
      return;
    }
    if (activeTab === 'rdv' && !rdvDate) {
      setValidationError('Veuillez sélectionner une date de rendez-vous souhaitée.');
      return;
    }

    setIsSubmitting(true);

    // Mock API processing
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setRdvDate('');
    setRdvTime('Matin (09:00 - 12:00)');
    setIsSuccess(false);
  };

  const contactInfo = [
    {
      title: 'Adresse physique',
      value: "Avenue de l'Indépendance, Les Berges du Lac 2, Tunis, Tunisie",
      icon: <MapPin className="w-5 h-5 text-primary" />,
    },
    {
      title: 'Téléphone direct',
      value: '+216 71 000 000 / +216 22 000 000',
      icon: <Phone className="w-5 h-5 text-primary" />,
    },
    {
      title: 'Adresse email',
      value: 'contact@rm-consulting.tn',
      icon: <Mail className="w-5 h-5 text-primary" />,
    },
    {
      title: 'Horaires d\'ouverture',
      value: 'Lun - Ven: 08:30 - 17:30 (Heure de Tunis)',
      icon: <Clock className="w-5 h-5 text-primary" />,
    },
  ];

  return (
    <section id="contact" className="py-20 sm:py-28 bg-surface-container scroll-mt-12 text-left">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-center">
            <div>
              <span className="text-primary font-display font-bold tracking-widest text-xs uppercase block mb-3">
                Localisation &amp; Contact
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-on-surface mb-6">
                Nous Rejoindre
              </h2>
              <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-8">
                Nos bureaux sont situés au cœur du quartier d'affaires des Berges du Lac 2 à Tunis. Venez nous rencontrer pour échanger de vive voix sur vos enjeux de croissance financière.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.map((info, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-secondary/10 flex gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-primary text-sm mb-0.5">{info.title}</h4>
                    <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      {info.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Comprehensive Interactive Portal Form */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 relative overflow-hidden">
            
            {/* Dynamic Success Overlay */}
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
                    Demande transmise avec succès !
                  </h3>
                  <p className="font-sans text-on-surface-variant max-w-md mb-8 leading-relaxed">
                    Merci pour votre confiance. Un de nos experts-comptables associés étudie actuellement votre dossier. Nous vous recontacterons sous 24 heures ouvrées.
                  </p>
                  <button
                    onClick={resetForm}
                    className="bg-primary hover:bg-primary-container text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow active:scale-95 cursor-pointer"
                  >
                    Envoyer une autre demande
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab Switches */}
            <div className="flex gap-8 border-b border-gray-100 mb-8">
              <button
                onClick={() => {
                  setActiveTab('message');
                  setValidationError('');
                }}
                className={`pb-4 border-b-2 font-display font-bold text-sm sm:text-base transition-colors cursor-pointer ${
                  activeTab === 'message'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-400 hover:text-primary'
                }`}
              >
                Envoyer un Message
              </button>
              <button
                onClick={() => {
                  setActiveTab('rdv');
                  setValidationError('');
                }}
                className={`pb-4 border-b-2 font-display font-bold text-sm sm:text-base transition-colors cursor-pointer ${
                  activeTab === 'rdv'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-400 hover:text-primary'
                }`}
              >
                Prendre un Rendez-vous d’Affaires
              </button>
            </div>

            {/* validation banner */}
            {validationError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Core Form */}
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Nom Complet</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                    placeholder="Ex: Karim Ben Salem"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Adresse Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Dynamic Appointment Booking fields */}
              {activeTab === 'rdv' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 border-y border-gray-100 py-6"
                >
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                      Date Souhaitée de Rencontre
                    </label>
                    <input
                      type="date"
                      value={rdvDate}
                      onChange={(e) => setRdvDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                      Créneau Horaire Préféré
                    </label>
                    <select
                      value={rdvTime}
                      onChange={(e) => setRdvTime(e.target.value)}
                      className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                    >
                      <option value="Matin (09:00 - 12:00)">Matinée (09h00 - 12h00)</option>
                      <option value="Midi (12:00 - 14:00)">Pause Déjeuner (12h00 - 14h00)</option>
                      <option value="Après-midi (14:00 - 17:00)">Après-midi (14h00 - 17h00)</option>
                    </select>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Sujet / Projet Principal</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                  placeholder="Ex: Certification ISO 9001 / Conseil en intégration fiscale"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                  {activeTab === 'message' ? 'Message Explicatif' : 'Détails Additionnels (Optionnel)'}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-surface border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary focus:border-secondary focus:outline-none transition-all text-gray-900"
                  placeholder={
                    activeTab === 'message'
                      ? 'Détails de votre demande...'
                      : 'Indiquez-nous brièvement le but de la rencontre pour préparer au mieux le rendez-vous...'
                  }
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
                    {activeTab === 'message' ? 'Envoyer la Demande' : 'Réserver mon Rendez-vous'}
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
