import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Calendar, Send, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface AvailableDate {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  timeSlots: string[];
  bookedSlots: string[];
}

const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

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
  const [rdvTime, setRdvTime] = useState('');
  
  // Calendar state
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [selectedDateSlots, setSelectedDateSlots] = useState<string[]>([]);
  const [bookedSlotsForDate, setBookedSlotsForDate] = useState<string[]>([]);

  // Fetch available dates
  useEffect(() => {
    fetch('/api/available-dates')
      .then((r) => r.json())
      .then((data: any) => setAvailableDates(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Update available time slots when date is selected
  useEffect(() => {
    if (rdvDate) {
      const match = availableDates.find((d) => d.date.split('T')[0] === rdvDate);
      if (match) {
        const booked = match.bookedSlots || [];
        setSelectedDateSlots(match.timeSlots);
        setBookedSlotsForDate(booked);
        const firstAvailable = match.timeSlots.find(s => !booked.includes(s));
        setRdvTime(firstAvailable || '');
      } else {
        setSelectedDateSlots([]);
        setBookedSlotsForDate([]);
        setRdvTime('');
      }
    }
  }, [rdvDate, availableDates]);

  // Build available date lookup set
  const availableDateSet = new Set(availableDates.map((d) => d.date.split('T')[0]));

  // Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

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
      setValidationError('Veuillez sélectionner une date de rendez-vous.');
      return;
    }
    if (activeTab === 'rdv' && !rdvTime) {
      setValidationError('Veuillez sélectionner un créneau horaire.');
      return;
    }
    if (activeTab === 'rdv' && bookedSlotsForDate.includes(rdvTime)) {
      setValidationError('Ce créneau est déjà réservé. Veuillez en choisir un autre.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === 'rdv') {
        await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientName: fullName.trim(),
            email: email.trim(),
            date: rdvDate,
            timeSlot: rdvTime,
            subject: subject.trim(),
            details: message.trim(),
          }),
        });
      } else {
        const nameParts = fullName.trim().split(' ');
        const initials = nameParts.length >= 2
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
          : fullName.trim().slice(0, 2).toUpperCase();
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: fullName.trim(),
            role: 'Client',
            initials,
            time: timeStr,
            content: `[${subject.trim()}]\n\nEmail: ${email.trim()}\n\n${message.trim()}`,
            isUnread: true,
            email: email.trim(),
          }),
        });
      }
    } catch {
      // fallback
    }

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setRdvDate('');
    setRdvTime('');
    setSelectedDateSlots([]);
    setBookedSlotsForDate([]);
    setIsSuccess(false);
  };

  const contactInfo = [
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

            {/* Carte Adresse avec aperçu Google Maps */}
            <a
              href="https://maps.app.goo.gl/qGSWiDX5ocAamW4v7"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white p-5 rounded-2xl shadow-sm border border-secondary/10 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-primary text-sm mb-0.5">Adresse physique</h4>
                  <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    RM Consulting, Lot 17 DDHBC, Lotissement Ennasim, Monplaisir, Tunis, Tunisie
                  </p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-gray-100">
                <iframe
                  title="Localisation RM Consulting"
                  src="https://www.google.com/maps?q=Avenue+de+l'Independance,+Les+Berges+du+Lac+2,+Tunis,+Tunisie&output=embed&z=16"
                  width="100%"
                  height="120"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="pointer-events-none"
                />
              </div>
            </a>

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
                  className="border-y border-gray-100 py-6 space-y-6"
                >
                  {/* Mini Calendar */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-3">
                      Date Souhaitée de Rencontre
                    </label>
                    <div className="bg-surface border border-gray-200 rounded-xl p-4 max-w-sm">
                      <div className="flex items-center justify-between mb-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
                            else { setCalMonth(calMonth - 1); }
                          }}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-sm font-bold text-gray-800">
                          {MONTH_NAMES[calMonth]} {calYear}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
                            else { setCalMonth(calMonth + 1); }
                          }}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center mb-1">
                        {DAY_NAMES.map((d) => (
                          <div key={d} className="text-[9px] font-bold text-gray-400 py-1">{d}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: getFirstDayOfMonth(calYear, calMonth) }).map((_, i) => (
                          <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: getDaysInMonth(calYear, calMonth) }).map((_, i) => {
                          const day = i + 1;
                          const dateStr = toDateString(calYear, calMonth, day);
                          const isAvailable = availableDateSet.has(dateStr);
                          const isSelected = rdvDate === dateStr;
                          const isPast = new Date(dateStr) < new Date(new Date().toDateString());
                          return (
                            <button
                              key={day}
                              type="button"
                              disabled={!isAvailable || isPast}
                              onClick={() => setRdvDate(dateStr)}
                              className={`relative p-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-primary text-white shadow-md'
                                  : isAvailable && !isPast
                                  ? 'bg-secondary/10 text-primary hover:bg-secondary/20 font-bold'
                                  : 'text-gray-300 cursor-not-allowed'
                              }`}
                            >
                              {day}
                              {isAvailable && !isPast && !isSelected && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {rdvDate && (
                        <p className="text-[10px] text-gray-500 mt-2 text-center">
                          Date sélectionnée : {new Date(rdvDate + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Time Slot Selection */}
                  {selectedDateSlots.length > 0 && (
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-3">
                        Créneau Horaire Préféré (30 min)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedDateSlots.map((slot) => {
                          const isBooked = bookedSlotsForDate.includes(slot);
                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={isBooked}
                              onClick={() => setRdvTime(slot)}
                              className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                                isBooked
                                  ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                                  : rdvTime === slot
                                  ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary cursor-pointer'
                                  : 'border-gray-200 text-gray-600 hover:border-primary/40 hover:bg-gray-50 cursor-pointer'
                              }`}
                            >
                              <Clock className="w-4 h-4 inline mr-2" />
                              {slot}
                              {isBooked && <span className="text-[10px] text-red-400 ml-2">Réservé</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {rdvDate && selectedDateSlots.length > 0 && bookedSlotsForDate.length === selectedDateSlots.length && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl">
                      Tous les créneaux sont réservés pour cette date.
                    </p>
                  )}
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
