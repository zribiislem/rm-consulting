import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Department from './models/Department.js';
import Mission from './models/Mission.js';
import Message from './models/Message.js';
import AvailableDate from './models/AvailableDate.js';
import Appointment from './models/Appointment.js';
import Stat from './models/Stat.js';
import Reference from './models/Reference.js';

const seedData = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not defined');

    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding...');

    await Department.deleteMany({});
    await Mission.deleteMany({});
    await Message.deleteMany({});
    await AvailableDate.deleteMany({});
    await Appointment.deleteMany({});
    await Stat.deleteMany({});
    await Reference.deleteMany({});

    await Department.insertMany([
      {
        name: 'Département Expertise Comptable',
        description: "Département spécialisé en audit contractuel et audit légal, supervisé par Youssef Garbaa.",
        head: 'Youssef Garbaa',
        staffCount: 4,
        activeProjects: 8,
        services: [
          "Audit contractuel",
          "Audit légal"
        ]
      },
      {
        name: 'Département Audit',
        description: "Département spécialisé en tenue de comptabilité et assistance comptable, supervisé par Khaireddine Kerkeni.",
        head: 'Khaireddine Kerkeni',
        staffCount: 5,
        activeProjects: 10,
        services: [
          "Tenue de comptabilité",
          "Assistance"
        ]
      },
      {
        name: 'Département Taxe',
        description: "Département spécialisé en assistance fiscale, contentieux fiscal et diligence raisonnable, supervisé par Ridha Ouhibi.",
        head: 'Ridha Ouhibi',
        staffCount: 3,
        activeProjects: 6,
        services: [
          "Assistance Fiscale",
          "Contentieux fiscal",
          "Diligence raisonnable"
        ]
      },
      {
        name: 'Département Consulting',
        description: "Département spécialisé en accompagnement à la certification, restructuration d'entreprise et autres missions spéciales, supervisé par Mihoub Rezgui.",
        head: 'Mihoub Rezgui',
        staffCount: 2,
        activeProjects: 5,
        services: [
          "Accompagnement à la certification",
          "Restructuration d'entreprise",
          "Autres missions spéciales"
        ]
      }
    ]);

    await Mission.insertMany([
      {
        title: 'Restructuration Entreprise BTP',
        client: 'Routes Voiries & Ouvrages Hydrauliques',
        department: 'Conseil',
        status: 'EN COURS',
        progression: 65
      },
      {
        title: 'Programme Création Services',
        client: 'Partenaire Bancaire',
        department: 'Comptabilité',
        status: 'TERMINÉ',
        progression: 100
      },
      {
        title: 'Certification ISO 9001 & 21001',
        client: 'Établissement Privé Enseignement',
        department: 'Juridique',
        status: 'EN COURS',
        progression: 45
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

    const today = new Date();
    const availDates = [];
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        const dateStr = d.toISOString().split('T')[0];
        availDates.push({
          date: dateStr,
          timeSlots: ['09:00', '10:30', '14:00', '15:30']
        });
      }
    }
    await AvailableDate.insertMany(availDates);

    await Stat.insertMany([
      { value: '80+', label: 'Clients Actifs', order: 1 },
      { value: '14', label: 'Experts & Collaborateurs', order: 2 },
      { value: '4', label: 'Départements', order: 3 },
      { value: '8+', label: "Années d'Expérience", order: 4 },
    ]);

    await Reference.insertMany([
      { name: 'SOBATRAP', category: 'BTP', order: 1, imageUrl: '' },
      { name: 'UIB', category: 'Banque', order: 2, imageUrl: '' },
      { name: 'UPES', category: 'Éducation', order: 3, imageUrl: '' },
      { name: 'API', category: 'Conseil', order: 4, imageUrl: '' },
      { name: 'The Face', category: 'Restauration', order: 5, imageUrl: '' },
      { name: 'A-WEB', category: 'Loisir', order: 6, imageUrl: '' },
      { name: 'ATOG', category: 'Énergie', order: 7, imageUrl: '' },
      { name: 'VAGA LAND', category: 'Loisir', order: 8, imageUrl: '' },
      { name: 'SOBMTI', category: 'BTP', order: 9, imageUrl: '' },
      { name: 'Sword Corp', category: 'Technologie', order: 10, imageUrl: '' },
      { name: 'Groupe Sécure', category: 'Sécurité', order: 11, imageUrl: '' },
      { name: 'GFA Consulting Group', category: 'Conseil', order: 12, imageUrl: '' },
      { name: 'Harmonia Pharma', category: 'Pharma', order: 13, imageUrl: '' },
      { name: 'Uthina Chemical Industries', category: 'Industrie', order: 14, imageUrl: '' },
      { name: 'ECC', category: 'BTP', order: 15, imageUrl: '' },
      { name: 'Top Oilfield Services', category: 'Énergie', order: 16, imageUrl: '' },
      { name: 'KSS', category: 'Sécurité', order: 17, imageUrl: '' },
      { name: 'VoyageKom', category: 'Tourisme', order: 18, imageUrl: '' },
      { name: 'Méditerranée Thalasso & Golf', category: 'Hôtellerie', order: 19, imageUrl: '' },
      { name: 'Radisson Hotel Sfax', category: 'Hôtellerie', order: 20, imageUrl: '' },
      { name: 'Houria Palace', category: 'Hôtellerie', order: 21, imageUrl: '' },
      { name: 'Umm Algouzlan Travel', category: 'Tourisme', order: 22, imageUrl: '' },
      { name: 'Vacanza Tours', category: 'Tourisme', order: 23, imageUrl: '' },
      { name: 'Tunisie Transformateurs', category: 'Industrie', order: 24, imageUrl: '' },
      { name: 'ENSIT', category: 'Éducation', order: 25, imageUrl: '' },
      { name: 'Hôtel Nour Congress & Resort', category: 'Hôtellerie', order: 26, imageUrl: '' },
      { name: 'The Sindbad Hotel', category: 'Hôtellerie', order: 27, imageUrl: '' },
      { name: 'Gîte du Pêcheur', category: 'Hôtellerie', order: 28, imageUrl: '' },
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
