import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Department from './models/Department.js';
import Mission from './models/Mission.js';
import Message from './models/Message.js';

const seedData = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not defined');

    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding...');

    await Department.deleteMany({});
    await Mission.deleteMany({});
    await Message.deleteMany({});

    await Department.insertMany([
      {
        name: 'Audit Légal',
        description: "Certification des comptes et commissariat aux comptes. Évaluation rigoureuse des risques financiers et de la conformité réglementaire pour sécuriser vos partenaires tiers.",
        head: 'Marc-Antoine Durand (Associé)',
        staffCount: 12,
        activeProjects: 8,
        services: [
          "Commissariat aux comptes (certification annuelle)",
          "Audits d'acquisition et due diligence financière",
          "Évaluation du contrôle interne et conformité",
          "Audit d'introduction en bourse ou de restructuration"
        ]
      },
      {
        name: 'Conseil & Stratégie',
        description: "Accompagnement stratégique lors des fusions-acquisitions, restructurations financières et transition managériale. Maximisez la valeur de vos transactions et facilitez vos prises de décision.",
        head: 'Lucas Chen (Directeur)',
        staffCount: 8,
        activeProjects: 5,
        services: [
          "Accompagnement en fusions & acquisitions (M&A)",
          "Restructuration financière et optimisation de trésorerie",
          "Élaboration de business plans et prévisionnels stratégiques",
          "Conseil en gouvernance et pilotage de la performance"
        ]
      },
      {
        name: 'Comptabilité & Expertise',
        description: "Tenue, révision et consolidation des comptes. De la gestion comptable quotidienne aux reportings financiers consolidés complexes, nous assurons une visibilité parfaite sur vos indicateurs.",
        head: 'Sophie Martin (Chef de Mission)',
        staffCount: 18,
        activeProjects: 14,
        services: [
          "Tenue complète ou partagée de la comptabilité",
          "Établissement des comptes annuels (bilans, comptes de résultat)",
          "Consolidation de comptes en normes nationales ou IFRS",
          "Tableaux de bord mensuels et indicateurs clés d'activité (KPI)"
        ]
      },
      {
        name: 'Fiscalité',
        description: "Optimisation de la stratégie fiscale d'entreprise et accompagnement lors des contrôles. Nous sécurisons vos opérations tout en identifiant les opportunités fiscales légitimes.",
        head: 'Benoit Lefebvre (Expert Fiscal)',
        staffCount: 6,
        activeProjects: 9,
        services: [
          "Conseil et ingénierie fiscale (nationale & internationale)",
          "Audit fiscal préventif et sécurisation des risques",
          "Assistance en cas de vérification ou de contrôle fiscal",
          "Optimisation des dispositifs d'innovation (CIR, CII, Statut JEI)"
        ]
      },
      {
        name: 'Juridique & Droit',
        description: "Gestion de la vie sociale de votre entreprise, de la constitution à la dissolution. Nous sécurisons vos contrats commerciaux, pactes d'actionnaires et l'ensemble des formalités administratives.",
        head: 'Claire Rousseau (Juriste d\'Affaires)',
        staffCount: 5,
        activeProjects: 7,
        services: [
          "Secrétariat juridique annuel (AG, rapports de gestion)",
          "Rédaction de pactes d'associés et contrats commerciaux complexes",
          "Opérations sur capital (augmentations, réductions)",
          "Assistance juridique lors de la création ou restructuration de sociétés"
        ]
      }
    ]);

    await Mission.insertMany([
      {
        title: 'Audit Annuel 2023',
        client: 'TechFlow SAS',
        department: 'Audit Légal',
        status: 'REVUE FINAL',
        progression: 85
      },
      {
        title: 'Fusion-Acquisition',
        client: 'ImmoBail SARL',
        department: 'Conseil',
        status: 'DUE DILIGENCE',
        progression: 42
      },
      {
        title: 'Consolidation Comptes',
        client: 'Global Logistics',
        department: 'Comptabilité',
        status: 'VALIDE',
        progression: 100
      }
    ]);

    await Message.insertMany([
      {
        sender: 'Sophie Martin',
        role: 'Client - TechFlow',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcTqx7ZWMrm0Oqi0lS-j6D45AO2ffgxYZG4AN-sANd4iiQG43SPv78eNm70lQ3zXVRCSKUE9zBEjHnp9kT-P9sJeEbpkEdgWuTItB6N2bVijaknJpv1lpSk746m7DgetJtROG87DjCMQsjJceuz4IztIp1LLBUlJ-daeNEI7h9buKL1ViWwgn1bGFCHicZKmghzHP8qa4ZMULnYNSEkC8J16XtoTS0t5jvX4wGQwVIUwH4fOUbTYnnXg',
        time: '10:45',
        content: "J'ai envoyé les justificatifs pour le dossier audit de TechFlow.",
        isUnread: true
      },
      {
        sender: 'Lucas Chen',
        role: 'Directeur de Projet',
        initials: 'LC',
        time: 'Hier',
        content: 'Confirmation du rendez-vous pour la fusion demain avec ImmoBail.',
        isUnread: true
      },
      {
        sender: 'Benoit Lefebvre',
        role: 'Expert Fiscal',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8Izhy45UgM5h59zpPrVXb3ljOZ4K1xVufu1XuJTklsUQIOpNUo3HLcNfdmZB-lhlZ-j1KCbZCp46v6TEYwJchUTh9ZjceF_AvHvTMwZfRXpyskcAKzfjZW6X-1tCqmMNreTdNBqPK-WXKKpyxJOsZQRKZPQj8SMTrtmMjmjdWRMyHtWFvPnf8TRJDaWq2msoGfDCjXgh2VdMbNsDVM7XAl0Dd9aIzSCFnWsPFZE7q9lXtXVtFvismjQ',
        time: 'Hier',
        content: 'Questions concernant la structure fiscale internationale de Global Logistics.',
        isUnread: false
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
