import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Briefcase,
  MapPin,
  ArrowLeft,
  CalendarDays,
  Users,
  GraduationCap,
  Target,
  CheckCircle2,
  ListChecks,
  Sparkles,
  Send,
  Building2,
} from 'lucide-react';
import {
  JobOffer,
  contractBadgeCls,
  formatOfferDate,
  isOfferExpired,
} from '../offers';

export default function JobOfferDetailPage({ offerId }: { offerId: string }) {
  const [offer, setOffer] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`/api/job-offers/public/${offerId}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          setOffer(null);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setOffer(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [offerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-on-surface-variant">Chargement de l'offre...</p>
        </div>
      </div>
    );
  }

  if (notFound || !offer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-primary/50" />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-on-surface mb-3">
            Offre indisponible
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
            Cette offre a été fermée, expirée ou n'existe plus. Découvrez nos autres opportunités ou
            déposez une candidature spontanée.
          </p>
          <a
            href="#/offres"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux offres
          </a>
        </div>
      </div>
    );
  }

  const expired = isOfferExpired(offer);

  return (
    <div className="bg-background text-on-background min-h-screen relative overflow-x-hidden">
      {/* Header band */}
      <div className="relative py-20 md:py-24 overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-burgundy-overlay opacity-60" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-10">
          <a
            href="#/offres"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux offres
          </a>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white border border-white/20">
                <Building2 className="w-3.5 h-3.5 mr-1.5" />
                {offer.department}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${contractBadgeCls(offer.contractType)}`}>
                {offer.contractType}
              </span>
              {offer.openPositions != null && offer.openPositions > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white border border-white/20">
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  {offer.openPositions} poste{offer.openPositions > 1 ? 's' : ''}
                </span>
              )}
              {expired && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                  Offre expirée
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4">
              {offer.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/85 text-sm">
              <span className="inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary-fixed" />
                {offer.location}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-secondary-fixed" />
                Publiée le {formatOfferDate(offer.publishedAt)}
              </span>
              {offer.applicationDeadline && (
                <span className="inline-flex items-center gap-2">
                  <Users className="w-4 h-4 text-secondary-fixed" />
                  Candidatures jusqu'au {formatOfferDate(offer.applicationDeadline)}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 space-y-10"
            >
              <div className="glass-card rounded-2xl p-7 md:p-9">
                <h2 className="font-display text-xl font-extrabold text-primary mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-secondary" />
                  Description du poste
                </h2>
                <p className="text-on-surface leading-relaxed text-[15px] whitespace-pre-line">
                  {offer.description}
                </p>
              </div>

              {(offer.missions || []).length > 0 && (
                <div className="glass-card rounded-2xl p-7 md:p-9">
                  <h2 className="font-display text-xl font-extrabold text-primary mb-5 flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-secondary" />
                    Missions principales
                  </h2>
                  <ul className="space-y-3">
                    {offer.missions.map((m, i) => (
                      <li key={i} className="flex items-start gap-3 text-on-surface text-[15px]">
                        <span className="mt-1 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(offer.skills || []).length > 0 && (
                <div className="glass-card rounded-2xl p-7 md:p-9">
                  <h2 className="font-display text-xl font-extrabold text-primary mb-5 flex items-center gap-2">
                    <Target className="w-5 h-5 text-secondary" />
                    Compétences recherchées
                  </h2>
                  <div className="flex flex-wrap gap-2.5">
                    {offer.skills.map((s, i) => (
                      <span key={i} className="px-4 py-2 bg-primary/5 text-primary border border-primary/15 rounded-full text-sm font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {offer.profile && (
                <div className="glass-card rounded-2xl p-7 md:p-9">
                  <h2 className="font-display text-xl font-extrabold text-primary mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-secondary" />
                    Profil recherché
                  </h2>
                  <p className="text-on-surface leading-relaxed text-[15px] whitespace-pre-line">
                    {offer.profile}
                  </p>
                </div>
              )}

              {(offer.benefits || []).length > 0 && (
                <div className="glass-card rounded-2xl p-7 md:p-9">
                  <h2 className="font-display text-xl font-extrabold text-primary mb-5 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    Avantages
                  </h2>
                  <div className="flex flex-wrap gap-2.5">
                    {offer.benefits.map((b, i) => (
                      <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-sm font-bold">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-1"
            >
              <div className="glass-card rounded-2xl p-7 lg:sticky lg:top-24">
                <h3 className="font-display text-lg font-extrabold text-primary mb-5">
                  Informations clés
                </h3>

                <div className="space-y-4 mb-7">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Lieu</p>
                      <p className="text-sm font-bold text-on-surface">{offer.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Type de contrat</p>
                      <p className="text-sm font-bold text-on-surface">{offer.contractType}</p>
                    </div>
                  </div>

                  {offer.requiredExperience && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Expérience requise</p>
                        <p className="text-sm font-bold text-on-surface">{offer.requiredExperience}</p>
                      </div>
                    </div>
                  )}

                  {offer.educationLevel && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Niveau d'étude</p>
                        <p className="text-sm font-bold text-on-surface">{offer.educationLevel}</p>
                      </div>
                    </div>
                  )}

                  {offer.applicationDeadline && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Date limite</p>
                        <p className="text-sm font-bold text-on-surface">{formatOfferDate(offer.applicationDeadline)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {!expired ? (
                  <a
                    href={`#/postuler?offer=${offer._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-container text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Postuler
                  </a>
                ) : (
                  <div className="w-full inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-500 py-4 rounded-xl font-bold cursor-not-allowed">
                    Offre expirée
                  </div>
                )}

                <p className="text-[11px] text-on-surface-variant text-center mt-4 leading-relaxed">
                  Votre candidature sera directement transmise à notre équipe RH avec toutes les informations
                  de cette offre.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
