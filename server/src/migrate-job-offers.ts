import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from './config/db.js';
import JobOffer from './models/JobOffer.js';

/**
 * Migration ponctuelle des offres d'emploi existantes vers le nouveau schéma :
 * - `requiredSkills` -> `skills`
 * - `isActive` (booléen) -> `status` (draft / published / closed)
 * - `publishedAt` initialisée pour les offres publiées
 *
 * Note : la lecture et l'écriture passent par la collection MongoDB brute
 * (`JobOffer.collection`) car les anciens champs (`requiredSkills`, `isActive`)
 * sont absents du nouveau schéma Mongoose et seraient ignorés (strict mode).
 */
const migrate = async (): Promise<void> => {
  const raw = await JobOffer.collection.find({}).toArray();
  let migrated = 0;
  let closed = 0;

  for (const doc of raw) {
    const id = doc._id;
    const legacySkills = Array.isArray(doc.requiredSkills) ? doc.requiredSkills : undefined;
    const legacyActive = typeof doc.isActive === 'boolean' ? doc.isActive : undefined;
    const legacyStatus = typeof doc.status === 'string' ? doc.status : undefined;
    const deadline = doc.applicationDeadline ? new Date(doc.applicationDeadline) : undefined;
    const now = new Date();

    const update: Record<string, unknown> = {};
    const unset: Record<string, unknown> = {};
    let changed = false;

    if (legacySkills && legacySkills.length > 0 && !Array.isArray(doc.skills)) {
      update.skills = legacySkills;
      changed = true;
    }

    if (legacyActive !== undefined && !legacyStatus) {
      update.status = legacyActive ? 'published' : 'draft';
      changed = true;
    }

    const isPublished = update.status === 'published' || legacyStatus === 'published';
    if (isPublished && !doc.publishedAt) {
      update.publishedAt = doc.createdAt ?? now;
      changed = true;
    }

    const isExpired = deadline && !Number.isNaN(deadline.getTime()) && deadline < now;
    if (isExpired && legacyStatus !== 'closed' && update.status !== 'closed') {
      update.status = 'closed';
      changed = true;
      closed++;
    }

    if (legacyActive !== undefined) {
      unset.isActive = '';
      changed = true;
    }
    if (legacySkills !== undefined) {
      unset.requiredSkills = '';
      changed = true;
    }

    if (changed) {
      const ops: { updateOne: { filter: { _id: mongoose.Types.ObjectId }; update: Record<string, unknown> } } = {
        updateOne: {
          filter: { _id: id as mongoose.Types.ObjectId },
          update: { ...(Object.keys(update).length ? { $set: update } : {}), ...(Object.keys(unset).length ? { $unset: unset } : {}) },
        },
      };
      await JobOffer.collection.bulkWrite([ops]);
      migrated++;
    }
  }

  console.log(`Migration terminée : ${migrated} offre(s) mise(s) à jour (dont ${closed} fermée(s) par échéance).`);
};

const waitForDb = async (): Promise<void> => {
  for (let i = 0; i < 30; i++) {
    if (mongoose.connection.readyState === 1) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error('Connexion MongoDB expirée (30 s)');
};

const isMain = (): boolean => {
  const script = process.argv[1] || '';
  return script.endsWith('migrate-job-offers.ts') || script.endsWith('migrate-job-offers.js');
};

if (isMain()) {
  (async () => {
    try {
      await connectDB();
      await waitForDb();
      await migrate();
      process.exit(0);
    } catch (error) {
      console.error('Migration failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  })();
}

export default migrate;
