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
    year: '2010',
    title: 'Fondation',
    description: 'Création du cabinet RM Consulting par Marc-Antoine Durand et Sophie Martin, avec la vision de proposer un audit et un conseil de niveau international aux entreprises tunisiennes.'
  },
  {
    year: '2013',
    title: 'Expansion',
    description: 'Ouverture du département Comptabilité & Expertise. Le cabinet atteint 50 clients actifs et renforce son expertise dans la consolidation de comptes en normes IFRS.'
  },
  {
    year: '2016',
    title: 'Certification',
    description: 'Obtention de la certification ISO 9001:2015. RM Consulting s\'impose comme l\'un des rares cabinets tunisiens à garantir un processus qualité certifié internationalement.'
  },
  {
    year: '2019',
    title: 'International',
    description: 'Lancement du pôle Conseil & Stratégie. Premier mandat d\'accompagnement en fusion-acquisition pour un groupe industriel franco-tunisien, marquant l\'entrée sur la scène internationale.'
  },
  {
    year: '2023',
    title: 'Innovation',
    description: 'Intégration de l\'intelligence artificielle et des outils digitaux dans nos processus d\'audit. Le cabinet compte désormais 80+ clients et 14 experts spécialisés.'
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
    answer: 'Absolument. Nous accompagnons des groupes internationaux implantés en Tunisie ainsi que des entreprises tunisiennes avec des filiales à l\'étranger. Notre réseau professionnel nous permet de couvrir les principales places financières mondiales.'
  },
  {
    id: 'fq4',
    question: 'Comment se déroule une première consultation ?',
    answer: 'La première consultation est gratuite et sans engagement. Nous analysons vos besoins, votre secteur d\'activité et vos enjeux financiers. Sous 48h, vous recevez une proposition d\'accompagnement personnalisée avec un chiffrage transparent.'
  },
  {
    id: 'fq5',
    question: 'Quels types d\'entreprises accompagnez-vous ?',
    answer: 'Nous travaillons avec des PME, des ETI et des grands groupes dans tous les secteurs : industrie, technologie, santé, agroalimentaire, immobilier et services financiers. Notre approche s\'adapte à la taille et aux enjeux spécifiques de chaque structure.'
  },
  {
    id: 'fq6',
    question: 'Proposez-vous un suivi annuel pour vos clients ?',
    answer: 'Oui, nous proposons des contrats de révision et de conseil annuel. Ces offres incluent des points trimestriels, une assistance fiscale continue, et un accès prioritaire à nos experts pour toute question urgente.'
  }
];

// --- Client References ---
export const clientReferences = [
  { name: 'BH Bank', category: 'Banque' },
  { name: 'STB', category: 'Banque' },
  { name: 'Biat', category: 'Banque' },
  { name: 'SOTIPAPIER', category: 'Industrie' },
  { name: 'Groupe CHIRAZ', category: 'Industrie' },
  { name: 'SIPHAT', category: 'Pharma' },
  { name: 'Genus Pharma', category: 'Pharma' },
  { name: 'Vermeg', category: 'Tech' },
  { name: 'Talan Tunisia', category: 'Tech' },
  { name: 'Socaf', category: 'Agro' },
  { name: 'Aridus', category: 'Agro' },
  { name: 'Top Chef', category: 'Industrie' }
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
    description: 'Accompagnement complet vers la certification ISO 9001, 14001, 27001 et 45001.',
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
    name: 'Marc-Antoine Durand',
    role: 'Associé Fondateur',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    bio: 'Expert-comptable inscrit à l\'OECT avec 20 ans d\'expérience en audit légal et conseil stratégique pour des groupes internationaux.'
  },
  {
    id: 'tm-2',
    name: 'Sophie Martin',
    role: 'Chef de Mission',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    bio: 'Spécialiste en consolidation et comptabilité IFRS. 15 ans d\'expérience dans l\'accompagnement des groupes multinotionaux.'
  },
  {
    id: 'tm-3',
    name: 'Lucas Chen',
    role: 'Directeur',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    bio: 'Expert en fusions-acquisitions et restructurations financières. Diplômé de HEC Paris, il pilote les transactions les plus sensibles du cabinet.'
  },
  {
    id: 'tm-4',
    name: 'Benoit Lefebvre',
    role: 'Expert Fiscal',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    bio: 'Consultant fiscal international, il optimise les stratégies fiscales de nos clients tout en assurant une conformité irréprochable.'
  },
  {
    id: 'tm-5',
    name: 'Claire Rousseau',
    role: 'Juriste d\'Affaires',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    bio: 'Juriste spécialisée en droit des sociétés et en droit commercial, elle sécurise l\'ensemble des opérations juridiques de nos clients.'
  },
  {
    id: 'tm-6',
    name: 'Youssef Benzarti',
    role: 'Manager Audit',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    bio: 'Manager audit certifié, il supervise les missions de certification et de due diligence pour les clients industriels et technologiques.'
  }
];

// --- Testimonials ---
export const testimonialsData = [
  {
    id: 'tst-1',
    quote: 'RM Consulting a transformé notre approche de l\'audit. Leur rigueur et leur capacité à anticiper les risques financiers nous ont fait gagner un temps précieux.',
    author: 'Henri Dupont',
    role: 'Directeur Financier',
    company: 'SOTIPAPIER',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80'
  },
  {
    id: 'tst-2',
    quote: 'L\'accompagnement en fusion-acquisition de Lucas Chen et son équipe a été déterminant pour la réussite de notre opération. Un partenaire de confiance.',
    author: 'Nadia Slimi',
    role: 'PDG',
    company: 'Groupe CHIRAZ',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80'
  },
  {
    id: 'tst-3',
    quote: 'Depuis que nous travaillons avec RM Consulting, notre conformité fiscale est assurée et nous avons identifié des opportunités d\'optimisation significatives.',
    author: 'Karim Trabelsi',
    role: 'DAF',
    company: 'Vermeg',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80'
  },
  {
    id: 'tst-4',
    quote: 'La certification ISO obtenue grâce à RM Consulting a boosté notre crédibilité auprès de nos partenaires internationaux. Un investissement rentabilisé en moins de 6 mois.',
    author: 'Amira Ben Salah',
    role: 'Quality Manager',
    company: 'SIPHAT',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80'
  }
];
