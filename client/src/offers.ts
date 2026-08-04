export interface JobOffer {
  _id: string;
  title: string;
  department: string;
  contractType: string;
  location: string;
  description: string;
  missions?: string[];
  skills?: string[];
  profile?: string;
  educationLevel?: string;
  requiredExperience?: string;
  benefits?: string[];
  status: 'draft' | 'published' | 'closed';
  publishedAt?: string;
  applicationDeadline?: string;
  openPositions?: number;
  createdAt: string;
}

export const OFFER_DEPARTMENTS = [
  'Expertise Comptable',
  'Audit',
  'Fiscalité',
  'Conseil',
  'Administratif',
  'Autre',
];

export const OFFER_CONTRACTS = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance'];

export const contractBadgeCls = (contract: string): string => {
  switch (contract) {
    case 'CDI':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CDD':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Stage':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Alternance':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Freelance':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

export const formatOfferDate = (date?: string): string =>
  date
    ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

export const isOfferExpired = (offer: JobOffer): boolean =>
  Boolean(offer.applicationDeadline) && new Date(offer.applicationDeadline) < new Date();
