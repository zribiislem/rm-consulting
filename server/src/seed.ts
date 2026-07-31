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
        department: 'Comptabilité',
        location: 'Tunis',
        contractType: 'CDI',
        description:
          'Nous recherchons un collaborateur comptable rigoureux pour rejoindre notre pôle comptabilité. Vous serez en charge de la tenue et du suivi de la comptabilité de nos clients, de la préparation des états financiers et de la relation avec les administrations fiscales.',
        requiredSkills: ['Maîtrise des normes comptables tunisiennes', 'Excel avancé', 'Esprit d\'analyse', 'Rigueur et organisation'],
        applicationDeadline: deadline(3),
        isActive: true,
      },
      {
        title: 'Auditeur junior',
        department: 'Audit Légal',
        location: 'Tunis',
        contractType: 'CDI',
        description:
          'Intégrez notre équipe d\'audit et participez à des missions de commissariat aux comptes et d\'audit contractuel auprès de sociétés de premier plan (industries, services, sociétés cotées).',
        requiredSkills: ['Diplôme en comptabilité / finance', 'Notions des normes IFRS', 'Bonnes capacités rédactionnelles', 'Travail en équipe'],
        applicationDeadline: deadline(2),
        isActive: true,
      },
      {
        title: 'Consultant fiscal',
        department: 'Fiscalité',
        location: 'Tunis',
        contractType: 'CDI',
        description:
          'Rejoignez notre département fiscalité pour accompagner nos clients dans leurs problématiques fiscales : optimisation, contentieux, contrôle fiscal et conseil au quotidien.',
        requiredSkills: ['Expertise en droit fiscal tunisien', 'Expérience en conseil fiscal', 'Capacité de synthèse', 'Aisance relationnelle'],
        applicationDeadline: deadline(4),
        isActive: true,
      },
      {
        title: 'Stagiaire comptable',
        department: 'Comptabilité',
        location: 'Tunis',
        contractType: 'Stage',
        description:
          'Stage d\'immersion au sein de notre cabinet : participation à la production comptable, découverte des dossiers clients et des missions d\'audit, en vue d\'une embauche pour les meilleurs profils.',
        requiredSkills: ['Formation en comptabilité (licence ou master)', 'Motivation et envie d\'apprendre', 'Maîtrise des outils bureautiques'],
        applicationDeadline: deadline(1),
        isActive: true,
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
