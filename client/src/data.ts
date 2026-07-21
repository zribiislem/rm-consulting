import { Service } from './types';

// --- Images ---
export const HERO_IMAGE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80';
export const TEAM_COLLAGE_IMAGE = 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80';
export const ABOUT_PEN_IMAGE = 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80';
export const ABOUT_BOARD_IMAGE = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80';
export const ABOUT_ATRIUM_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80';
export const COMPTA_DEPT_IMAGE = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80';
export const AUDIT_DEPT_IMAGE = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80';
export const ISO_DEPT_IMAGE = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80';
export const CONF_ROOM_IMAGE = 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80';

// --- Timeline ---
export const timelineEvents = [
  {
    year: '2017',
    title: 'Création',
    description: 'Création de RM CONSULTING le 01/01/2017 par M. Mihoub Rezgui, expert-comptable et associé gérant. Constitution d\'une équipe qualifiée et mise en place des outils de travail conformes aux normes professionnelles.'
  },
  {
    year: '2019',
    title: 'Expansion',
    description: 'Ouverture des départements Conseil & Stratégie et Fiscalité. Le cabinet atteint 40 clients actifs et renforce son expertise en accompagnement à la certification ISO et en restructuration d\'entreprise.'
  },
  {
    year: '2021',
    title: 'Agrément',
    description: 'Obtention de l\'agrément par la Banque Européenne de Restructuration et de Développement (BERD). RM Consulting s\'impose comme un cabinet de référence pour les projets internationaux de soutien aux PME.'
  },
  {
    year: '2023',
    title: 'International',
    description: 'Développement des missions d\'audit et de commissariat aux comptes au Niger, en Côte d\'Ivoire et au Cameroun. Premier mandat d\'accompagnement en restructuration pour un groupe de BTP international.'
  },
  {
    year: '2024',
    title: 'Qualité',
    description: 'Mise en place d\'un dispositif d\'assurance qualité conforme aux normes de l\'OECT. Développement d\'un manuel de procédures et de check-lists d\'intervention pour garantir la fiabilité et la rigueur de chaque mission.'
  },
  {
    year: '2025',
    title: 'Digitalisation',
    description: 'Transformation numérique complète avec mise en place de l\'outil IRIS pour la gestion intégrée des procédures internes. Déploiement d\'une application web pour le suivi en temps réel de l\'avancement des missions par les clients.'
  }
];

// --- FAQ ---
export const faqData = [
  {
    id: 'fq1',
    question: 'Quelles sont les garanties de confidentialité de vos services ?',
    answer: 'La confidentialité est au cœur de notre éthique professionnelle. Nous appliquons les normes les plus strictes de secret professionnel conformément au code de déontologie de l\'OECT. Toutes vos données sont hébergées sur des serveurs sécurisés avec chiffrement de bout en bout.'
  },
  {
    id: 'fq2',
    question: 'Combien de temps prend un audit complet ?',
    answer: 'La durée varie selon la taille et la complexité de l\'entreprise. Un audit légal standard pour une PME prend généralement 4 à 6 semaines. Pour les groupes internationaux ou les opérations de M&A, nous prévoyons 8 à 12 semaines avec une équipe dédiée.'
  },
  {
    id: 'fq3',
    question: 'Travaillez-vous avec les entreprises internationales ?',
    answer: 'Absolument. Nous accompagnons des groupes internationaux implantés en Tunisie ainsi que des entreprises tunisiennes avec des filiales à l\'étranger. Notre réseau professionnel nous permet de couvrir les principales places financières mondiales, notamment en Afrique subsaharienne.'
  },
  {
    id: 'fq4',
    question: 'Comment se déroule une première consultation ?',
    answer: 'La première consultation est gratuite et sans engagement. Nous analysons vos besoins, votre secteur d\'activité et vos enjeux financiers. Sous 48h, vous recevez une proposition d\'accompagnement personnalisée avec un chiffrage transparent.'
  },
  {
    id: 'fq5',
    question: 'Quels types d\'entreprises accompagnez-vous ?',
    answer: 'Nous travaillons avec des PME, des ETI et des grands groupes dans tous les secteurs : industrie, BTP, hôtellerie, technologie, santé, agroalimentaire, immobilier et services financiers. Notre approche s\'adapte à la taille et aux enjeux spécifiques de chaque structure.'
  },
  {
    id: 'fq6',
    question: 'Proposez-vous un suivi annuel pour vos clients ?',
    answer: 'Oui, nous proposons des contrats de révision et de conseil annuel. Ces offres incluent des points trimestriels, une assistance fiscale continue, et un accès prioritaire à nos experts pour toute question urgente.'
  }
];

// --- Client References ---
export const clientReferences = [
  { name: 'SOBATRAP', logo: '/logos/sobatrap.png', category: 'BTP' },
  { name: 'UIB', logo: '/logos/uib.png', category: 'Banque' },
  { name: 'UPES', logo: '/logos/upes.png', category: 'Éducation' },
  { name: 'APII', logo: '/logos/apii.png', category: 'Conseil' },
  { name: 'The Face', logo: '/logos/aweb.png', category: 'Restauration' },
  { name: 'Aweb', logo: '/logos/aweb.png', category: 'Immobilier' },
  { name: 'Anglo Tunisian Oil & Gas', logo: '/logos/Anglo Tunisian Oil & Gas.png', category: 'Énergie' },
  { name: 'Vaga Land', logo: '/logos/vaga land.png', category: 'Loisir' },
  { name: 'SOBA', logo: '/logos/vaga land.png', category: 'Loisir' },
  { name: 'SOBMTI', logo: '/logos/SOBMTI.png', category: 'BTP' },
  { name: 'Sword', logo: '/logos/sword.png', category: 'Sécurité' },
  { name: 'Groupe Secure', logo: '/logos/groupe secure.png', category: 'Sécurité' },
  { name: 'GFA Consulting Group', logo: '/logos/gfa.png', category: 'Conseil' },
  { name: 'Harmonia Pharma', logo: '/logos/harmonia.png', category: 'Pharma' },
  { name: 'Engineering & Construction Company', logo: '/logos/engineering and construction company.png', category: 'Énergie' },
  { name: 'Top Oilfield Services', logo: '/logos/Top Oilfield Services.png', category: 'Énergie' },
  { name: 'KSS', logo: '/logos/kss.png', category: 'Sécurité' },
  { name: 'Voyagekom', logo: '/logos/voyagekom.png', category: 'Tourisme' },
  { name: 'Hôtel Méditerranée', logo: '/logos/hôtel méditerranée thalasso golf.png', category: 'Hôtellerie' },
  { name: 'SUNMED', logo: '/logos/radisson sfax.png', category: 'Hôtellerie' },
  { name: 'YADIS', logo: '/logos/YADIS.png', category: 'Hôtellerie' },
  { name: 'Houria Palace', logo: '/logos/houria palace hotel.png', category: 'Hôtellerie' },
  { name: 'Umm Elgouzlane Travel', logo: '/logos/umm al gouzlan travel.png', category: 'Tourisme' },
  { name: 'Vacanza', logo: '/logos/vacanza.png', category: 'Tourisme' },
  { name: 'Tunisie Transformateurs', logo: '/logos/tunisie transformateur.png', category: 'Industrie' },
  { name: 'ENSIT', logo: '/logos/ensit.png', category: 'Éducation' },
  { name: 'Hotel Résidence Nour', logo: '/logos/hotel residence nour.png', category: 'Hôtellerie' },
  { name: 'The Sindbad', logo: '/logos/the sindbad.png', category: 'Hôtellerie' },
  { name: 'Harmonia Thalasso', logo: '/logos/harmonia.png', category: 'Santé' },
  { name: 'Gîte du Pêcheur', logo: '/logos/cite de pecheur.png', category: 'Hôtellerie' },
];

// --- Services ---
export const servicesData: Service[] = [
  {
    id: 'srv-1',
    category: 'Comptabilité',
    iconName: 'payments',
    title: 'Tenue Comptable',
    description: 'Tenue complète ou partagée de la comptabilité conforme aux normes tunisiennes et internationales.',
    subPoints: ['Écritures quotidiennes', 'Rapprochements bancaires', 'Déclarations TVA']
  },
  {
    id: 'srv-2',
    category: 'Comptabilité',
    iconName: 'analytics',
    title: 'Consolidation',
    description: 'Consolidation de comptes en normes nationales ou IFRS pour groupes multinotionaux.',
    subPoints: ['Normes IFRS', 'Éliminations inter-sociétés', 'Reportings financiers']
  },
  {
    id: 'srv-3',
    category: 'Audit',
    iconName: 'security',
    title: 'Audit Légal',
    description: 'Commissariat aux comptes et certification annuelle des états financiers.',
    subPoints: ['Certification annuelle', 'Revue contractuelle', 'Rapport spécial']
  },
  {
    id: 'srv-4',
    category: 'Audit',
    iconName: 'monitoring',
    title: 'Audit Interne',
    description: 'Évaluation du contrôle interne et recommandations d\'optimisation des processus.',
    subPoints: ['Cartographie des risques', 'Tests de conformité', 'Recommandations']
  },
  {
    id: 'srv-5',
    category: 'Conseil ISO',
    iconName: 'settings_suggest',
    title: 'Certification ISO',
    description: 'Accompagnement complet vers la certification ISO 9001, 14001, 45001 et 21001.',
    subPoints: ['Audit pré-diagnostic', 'Mise en place SMI', 'Formation interne']
  },
  {
    id: 'srv-6',
    category: 'Juridique',
    iconName: 'gavel',
    title: 'Droit des Sociétés',
    description: 'Gestion juridique complète de la vie sociale de votre entreprise.',
    subPoints: ['AG et rapports', 'Pactes d\'associés', 'Opérations sur capital']
  },
  {
    id: 'srv-7',
    category: 'Conseil ISO',
    iconName: 'diversity_3',
    title: 'Conseil en Management',
    description: 'Accompagnement stratégique pour l\'optimisation de la performance organisationnelle.',
    subPoints: ['Business plan', 'Restructuration', 'Due diligence']
  },
  {
    id: 'srv-8',
    category: 'Juridique',
    iconName: 'verified_user',
    title: 'Fiscalité',
    description: 'Ingénierie fiscale et optimisation de la stratégie fiscale d\'entreprise.',
    subPoints: ['CIR / CII', 'Contrôle fiscal', 'Planification fiscale']
  },
  {
    id: 'srv-9',
    category: 'Comptabilité',
    iconName: 'history_edu',
    title: 'Comptes Annuels',
    description: 'Établissement des bilans, comptes de résultat et annexes comptables.',
    subPoints: ['Bilan annuel', 'Tableau de flux', 'Annexes IFRS']
  },
  {
    id: 'srv-10',
    category: 'Audit',
    iconName: 'fact_check',
    title: 'Due Diligence',
    description: 'Audit d\'acquisition et évaluation des risques financiers lors de transactions.',
    subPoints: ['Analyse financière', 'Risques identifiés', 'Valorisation']
  },
  {
    id: 'srv-11',
    category: 'Conseil ISO',
    iconName: 'account_balance',
    title: 'Gouvernance',
    description: 'Conseil en gouvernance d\'entreprise et pilotage de la performance.',
    subPoints: ['Comité d\'audit', 'KPIs', 'Reporting direction']
  },
  {
    id: 'srv-12',
    category: 'Juridique',
    iconName: 'description',
    title: 'Contrats Commerciaux',
    description: 'Rédaction et négociation de contrats commerciaux et conventions inter-sociétés.',
    subPoints: ['CGV / CGU', 'Contrats de prestation', 'NDA']
  }
];

// --- Team ---
export const teamData = [
  {
    id: 'tm-1',
    name: 'Mihoub Rezgui',
    role: 'Gérant',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    bio: 'Expert-comptable inscrit à l\'OECT, gérant de RM Consulting. Supervise l\'ensemble des missions d\'audit, de conseil et d\'accompagnement à la certification.'
  },
  {
    id: 'tm-2',
    name: 'Youssef Garbaa',
    role: 'Expert Comptable',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    bio: 'Spécialiste en audit contractuel et audit légal. Chef du département Expertise Comptable.'
  },
  {
    id: 'tm-3',
    name: 'Khaireddine Kerkeni',
    role: 'Expert Comptable',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    bio: 'Spécialiste en tenue de comptabilité et assistance comptable. Chef du département Audit.'
  },
  {
    id: 'tm-4',
    name: 'Ridha Ouhibi',
    role: 'Expert Fiscal',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    bio: 'Expert en assistance fiscale, contentieux fiscal et diligence raisonnable. Chef du département Taxe.'
  },
];

// --- Testimonials ---
export const testimonialsData = [
  {
    id: 'tst-1',
    quote: 'RM Consulting a transformé notre approche de l\'audit. Leur rigueur et leur capacité à anticiper les risques financiers nous ont fait gagner un temps précieux.',
    author: 'Directeur Financier',
    role: 'Client Industrie',
    company: 'Secteur BTP',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80'
  },
  {
    id: 'tst-2',
    quote: 'L\'accompagnement en restructuration de RM Consulting a été déterminant pour la réussite de notre opération. Un partenaire de confiance.',
    author: 'PDG',
    role: 'Client International',
    company: 'Secteur BTP',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80'
  },
  {
    id: 'tst-3',
    quote: 'Depuis que nous travaillons avec RM Consulting, notre conformité fiscale est assurée et nous avons identifié des opportunités d\'optimisation significatives.',
    author: 'DAF',
    role: 'Client Tech',
    company: 'Secteur Numérique',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'
  },
  {
    id: 'tst-4',
    quote: 'La certification ISO obtenue grâce à RM Consulting a boosté notre crédibilité auprès de nos partenaires internationaux.',
    author: 'Quality Manager',
    role: 'Client Pharma',
    company: 'Secteur Santé',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80'
  }
];
