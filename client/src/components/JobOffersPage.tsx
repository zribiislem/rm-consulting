import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Briefcase,
  Search,
  MapPin,
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Users,
  GraduationCap,
  Building2,
  FileText,
  X,
} from 'lucide-react';
import {
  JobOffer,
  OFFER_DEPARTMENTS,
  OFFER_CONTRACTS,
  contractBadgeCls,
  formatOfferDate,
  isOfferExpired,
} from '../offers';

export default function JobOffersPage() {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('Tous les départements');
  const [contractFilter, setContractFilter] = useState('Tous les contrats');

  useEffect(() => {
    fetch('/api/job-offers/active')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setOffers(data))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredOffers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return offers.filter((o) => {
      const matchesSearch =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q) ||
        (o.skills || []).some((s) => s.toLowerCase().includes(q));
      const matchesDept = deptFilter === 'Tous les départements' || o.department === deptFilter;
      const matchesContract = contractFilter === 'Tous les contrats' || o.contractType === contractFilter;
      return matchesSearch && matchesDept && matchesContract && !isOfferExpired(o);
    });
  }, [offers, search, deptFilter, contractFilter]);

  return (
    <div className="bg-background text-on-background min-h-screen relative overflow-x-hidden">
      {/* Header band */}
      <div className="relative py-20 md:py-28 overflow-hidden bg-primary">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/videos/offers-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-burgundy-overlay opacity-85 z-0" />
        <motion.a
          href="#"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          title="Retour à l'accueil"
          aria-label="Retour à l'accueil"
          className="absolute top-5 left-5 md:top-7 md:left-7 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 text-white text-sm font-semibold hover:bg-white/25 active:scale-95 transition-all shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Retour</span>
        </motion.a>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ring-1 ring-white/10"
          >
            <Briefcase className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-3xl md:text-5xl font-extrabold text-white mb-6"
          >
            Nos Offres d'Emploi
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-sans"
          >
            Rejoignez un cabinet d'expertise comptable et d'audit de premier plan.
            Découvrez nos postes ouverts et construisons votre avenir ensemble.
          </motion.p>
          <motion.button
            type="button"
            onClick={() => document.getElementById('offers-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 text-white font-semibold text-sm hover:bg-white/25 active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            Voir plus
            <ChevronDown className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div id="offers-list" className="py-16 md:py-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un poste, une compétence..."
                className="w-full pl-12 pr-12 py-3.5 bg-white border border-outline-variant/60 rounded-xl text-sm focus:ring-2 focus:ring-secondary/40 focus:border-secondary focus:outline-none shadow-sm transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary hover:bg-secondary/10 rounded-full transition-colors cursor-pointer"
                  title="Effacer la recherche"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-white border border-outline-variant/60 rounded-xl shadow-sm">
                <Building2 className="w-4 h-4 text-secondary" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-transparent border-none p-0 text-sm focus:ring-0 text-primary font-semibold cursor-pointer outline-none"
                >
                  <option>Tous les départements</option>
                  {OFFER_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 bg-white border border-outline-variant/60 rounded-xl shadow-sm">
                <FileText className="w-4 h-4 text-secondary" />
                <select
                  value={contractFilter}
                  onChange={(e) => setContractFilter(e.target.value)}
                  className="bg-transparent border-none p-0 text-sm focus:ring-0 text-primary font-semibold cursor-pointer outline-none"
                >
                  <option>Tous les contrats</option>
                  {OFFER_CONTRACTS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Count */}
          {!loading && (
            <p className="text-sm text-on-surface-variant mb-6">
              <strong className="text-primary">{filteredOffers.length}</strong> offre{filteredOffers.length > 1 ? 's' : ''} disponible{filteredOffers.length > 1 ? 's' : ''}
              {search && <> pour « <strong className="text-primary">{search}</strong> »</>}
              {deptFilter !== 'Tous les départements' && <> en <strong className="text-primary">{deptFilter}</strong></>}
            </p>
          )}

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="glass-card rounded-2xl p-6 animate-shimmer">
                  <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
                  <div className="h-3 w-1/3 bg-gray-200 rounded mb-4" />
                  <div className="h-3 w-full bg-gray-100 rounded mb-2" />
                  <div className="h-3 w-5/6 bg-gray-100 rounded mb-2" />
                  <div className="h-3 w-4/6 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredOffers.length === 0 && (
            <div className="glass-card rounded-2xl p-14 text-center border border-dashed border-secondary/20">
              <Briefcase className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-on-surface mb-2">
                {offers.length === 0 ? 'Aucune offre pour le moment' : 'Aucune offre ne correspond à votre recherche'}
              </h3>
              <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                {offers.length === 0
                  ? 'Nos offres d\'emploi sont en cours de préparation. N\'hésitez pas à déposer une candidature spontanée, nous étudions tous les profils.'
                  : 'Essayez de modifier vos filtres ou votre recherche, ou déposez une candidature spontanée.'}
              </p>
              <a
                href="#/postuler"
                className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all shadow-md"
              >
                <Users className="w-4 h-4" />
                Candidature spontanée
              </a>
            </div>
          )}

          {/* Offers grid */}
          {!loading && filteredOffers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOffers.map((offer, index) => (
                <motion.a
                  key={offer._id}
                  href={`#/offres/${offer._id}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.4) }}
                  whileHover={{ y: -6 }}
                  className="glass-card rounded-2xl p-6 flex flex-col group hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary/70"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/5 text-primary border border-primary/15">
                          {offer.department}
                        </span>
                        <p className="text-[11px] text-on-surface-variant mt-1">
                          Publiée le {formatOfferDate(offer.publishedAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${contractBadgeCls(offer.contractType)}`}>
                      {offer.contractType}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-extrabold text-on-surface group-hover:text-primary transition-colors leading-snug mb-2">
                    {offer.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4 text-xs text-on-surface-variant">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-secondary" />
                      {offer.location}
                    </span>
                    {offer.requiredExperience && (
                      <span className="inline-flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-secondary" />
                        {offer.requiredExperience}
                      </span>
                    )}
                    {offer.openPositions != null && offer.openPositions > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-secondary" />
                        {offer.openPositions} poste{offer.openPositions > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 mb-6 flex-1">
                    {offer.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4 mt-auto">
                    <span className="text-[11px] text-on-surface-variant inline-flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-secondary" />
                      {offer.applicationDeadline
                        ? `Candidature jusqu'au ${formatOfferDate(offer.applicationDeadline)}`
                        : 'Candidatures ouvertes'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-primary text-sm font-bold group-hover:gap-2.5 transition-all">
                      Voir l'offre
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          )}

          {/* Spontaneous CTA */}
          <div className="mt-16 bg-primary rounded-2xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/5 rounded-full" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="font-display text-2xl font-extrabold text-white mb-2">
                  Vous ne trouvez pas le poste idéal ?
                </h3>
                <p className="text-sm text-white/80 max-w-xl leading-relaxed">
                  Déposez une candidature spontanée : notre équipe RH étudie chaque profil avec attention
                  et vous recontactera si une opportunité correspond à vos compétences.
                </p>
              </div>
              <a
                href="#/postuler"
                className="shrink-0 inline-flex items-center gap-2 bg-secondary-fixed text-primary px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-white transition-all shadow-lg active:scale-95"
              >
                <Users className="w-4 h-4" />
                Candidature spontanée
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}