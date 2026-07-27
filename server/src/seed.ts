import Admin from './models/Admin.js';

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

export default seedAdmin;
