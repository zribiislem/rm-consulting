import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Admin from './models/Admin.js';
import JobOffer from './models/JobOffer.js';

const seedAdmin = async (): Promise<void> => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set in .env — skipping admin seed.');
      return;
    }

    console.log(`Attempting to seed admin: ${email}`);

    const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      console.log('Admin already exists, skipping seed.');
      return;
    }

    await Admin.create({
      email: email.toLowerCase().trim(),
      password,
      name: 'Rezgui Mihoub',
    });

    console.log(`Admin seeded successfully: ${email}`);
  } catch (error) {
    console.error('Failed to seed admin:', error instanceof Error ? error.message : error);
  }
};

/** Offres d'emploi de démonstration (uniquement si la collection est vide). */
const seedJobOffers = async (): Promise<void> => {
  try {
    const count = await JobOffer.countDocuments();
    if (count > 0) {
      console.log('Job offers already exist, skipping seed.');
      return;
    }

    const deadline = (months: number): Date => {
      const d = new Date();
      d.setMonth(d.getMonth() + months);
      return d;
    };

    await JobOffer.insertMany([
      {
        title: 'Collaborateur comptable',
        department: 'Expertise Comptable',
        location: 'Tunis',
        contractType: 'CDI',
        description:
          'Nous recherchons un collaborateur comptable rigoureux pour rejoindre notre pôle expertise comptable. Vous serez en charge de la tenue et du suivi de la comptabilité de nos clients, de la préparation des états financiers et de la relation avec les administrations fiscales.',
        missions: [
          'Tenue et suivi de la comptabilité des dossiers clients',
          'Préparation des états financiers et des liasses fiscales',
          'Relation avec l\'administration fiscale et les tiers',
          'Participation aux clôtures annuelles',
        ],
        skills: ['Maîtrise des normes comptables tunisiennes', 'Excel avancé', 'Esprit d\'analyse', 'Rigueur et organisation'],
        profile:
          'Vous êtes diplômé(e) en comptabilité (licence ou master) et justifiez d\'au moins 2 ans d\'expérience dans un cabinet ou en entreprise. Vous êtes autonome, rigoureux(se) et à l\'aise avec les échéances.',
        educationLevel: 'Licence ou Master en comptabilité / finance',
        requiredExperience: '2 à 5 ans',
        benefits: ['Mutuelle groupe', 'Formation continue', 'Perspectives d\'évolution'],
        status: 'published',
        publishedAt: new Date(),
        applicationDeadline: deadline(3),
        openPositions: 2,
      },
      {
        title: 'Auditeur junior',
        department: 'Audit',
        location: 'Tunis',
        contractType: 'CDI',
        description:
          'Intégrez notre équipe d\'audit et participez à des missions de commissariat aux comptes et d\'audit contractuel auprès de sociétés de premier plan (industries, services, sociétés cotées).',
        missions: [
          'Participation aux missions de commissariat aux comptes',
          'Préparation des programmes d\'audit et des feuilles de travail',
          'Rédaction des rapports et des lettres de recommandation',
          'Missions d\'audit contractuel et due diligence',
        ],
        skills: ['Diplôme en comptabilité / finance', 'Notions des normes IFRS', 'Bonnes capacités rédactionnelles', 'Travail en équipe'],
        profile:
          'Jeune diplômé(e) (licence ou master) en comptabilité, audit ou finance, motivé(e) par les missions de terrain et souhaitant évoluer dans un cabinet reconnu.',
        educationLevel: 'Licence ou Master en comptabilité / audit / finance',
        requiredExperience: 'Moins de 2 ans (junior)',
        benefits: ['Encadrement par des seniors', 'Formation aux normes IFRS', 'Tickets restaurant'],
        status: 'published',
        publishedAt: new Date(),
        applicationDeadline: deadline(2),
        openPositions: 3,
      },
      {
        title: 'Consultant fiscal',
        department: 'Fiscalité',
        location: 'Tunis',
        contractType: 'CDI',
        description:
          'Rejoignez notre département fiscalité pour accompagner nos clients dans leurs problématiques fiscales : optimisation, contentieux, contrôle fiscal et conseil au quotidien.',
        missions: [
          'Conseil fiscal et optimisation au quotidien',
          'Accompagnement lors des contrôles fiscaux',
          'Études fiscales et notes de synthèse',
          'Contentieux fiscal et réclamations',
        ],
        skills: ['Expertise en droit fiscal tunisien', 'Expérience en conseil fiscal', 'Capacité de synthèse', 'Aisance relationnelle'],
        profile:
          'Expert fiscal confirmé(e) avec une solide expérience en cabinet, à l\'aise avec les dossiers complexes et les relations clients.',
        educationLevel: 'Master en droit fiscal ou expertise comptable',
        requiredExperience: '5 ans et plus',
        benefits: ['Rémunération attractive', 'Véhicule de fonction', 'Participation aux résultats'],
        status: 'published',
        publishedAt: new Date(),
        applicationDeadline: deadline(4),
        openPositions: 1,
      },
      {
        title: 'Stagiaire comptable',
        department: 'Expertise Comptable',
        location: 'Tunis',
        contractType: 'Stage',
        description:
          'Stage d\'immersion au sein de notre cabinet : participation à la production comptable, découverte des dossiers clients et des missions d\'audit, en vue d\'une embauche pour les meilleurs profils.',
        missions: [
          'Saisie et pointage comptable',
          'Préparation des dossiers clients',
          'Découverte des missions d\'audit',
          'Appui aux équipes opérationnelles',
        ],
        skills: ['Formation en comptabilité (licence ou master)', 'Motivation et envie d\'apprendre', 'Maîtrise des outils bureautiques'],
        profile: 'Étudiant(e) en comptabilité ou finance en quête d\'une première expérience professionnelle enrichissante.',
        educationLevel: 'Licence ou Master en comptabilité (en cours)',
        requiredExperience: 'Sans expérience requise',
        benefits: ['Indemnité de stage', 'Tutorat personnalisé', 'Possibilité d\'embauche'],
        status: 'published',
        publishedAt: new Date(),
        applicationDeadline: deadline(1),
        openPositions: 4,
      },
    ]);

    console.log('Sample job offers seeded successfully.');
  } catch (error) {
    console.error('Failed to seed job offers:', error instanceof Error ? error.message : error);
  }
};

const seedAll = async (): Promise<void> => {
  await seedAdmin();
  await seedJobOffers();
};

/** Attend que la connexion MongoDB soit établie (timeout 30 s). */
const waitForDb = async (): Promise<void> => {
  for (let i = 0; i < 30; i++) {
    if (mongoose.connection.readyState === 1) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('Connexion MongoDB expirée (30 s)');
};

// Exécution directe : `npm run seed`
const isMain = (): boolean => {
  const script = process.argv[1] || '';
  return script.endsWith('seed.ts') || script.endsWith('seed.js');
};

if (isMain()) {
  (async () => {
    try {
      await connectDB();
      await waitForDb();
      await seedAll();
      console.log('Seed terminé avec succès.');
      process.exit(0);
    } catch (error) {
      console.error('Seed failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  })();
}

export default seedAll;
