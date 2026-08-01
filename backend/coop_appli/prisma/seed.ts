import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const telephone = '0700000000'; // ← change avec le vrai numéro du trésorier
  const password = 'changeMoiRapidement123'; // ← change ce mot de passe après la 1ère connexion

  const existing = await prisma.user.findUnique({ where: { telephone } });
  if (existing) {
    console.log('Un compte existe déjà avec ce numéro, seed annulé.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      nom: 'Admin',
      prenom: 'Principal',
      telephone,
      passwordHash,
      role: Role.ADMIN,
      actif: true,
    },
  });

  console.log('Premier admin créé :', admin.telephone);
  console.log('Mot de passe temporaire :', password);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
