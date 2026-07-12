import { PrismaClient, Role } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

const adapter = new PrismaBetterSqlite3({
  url: databaseUrl,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database with URL:', databaseUrl);

  // 1. Seed Departments
  const it = await prisma.department.upsert({
    where: { code: 'IT' },
    update: {},
    create: {
      name: 'Information Technology',
      code: 'IT',
      isActive: true,
    },
  });

  const hr = await prisma.department.upsert({
    where: { code: 'HR' },
    update: {},
    create: {
      name: 'Human Resources',
      code: 'HR',
      isActive: true,
    },
  });

  const ops = await prisma.department.upsert({
    where: { code: 'OPS' },
    update: {},
    create: {
      name: 'Operations',
      code: 'OPS',
      isActive: true,
    },
  });

  console.log('Departments seeded.');

  // 2. Seed Admin User
  const passwordHash = await bcrypt.hash('AdminPassword123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@assetflow.com' },
    update: {},
    create: {
      employeeId: 'EMP-0001',
      email: 'admin@assetflow.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      isActive: true,
      departmentId: it.id,
    },
  });

  console.log('Admin user seeded.');

  // 3. Seed Hierarchical Categories
  const itEquipment = await prisma.assetCategory.upsert({
    where: { code: 'IT-EQ' },
    update: {},
    create: {
      name: 'IT Equipment',
      code: 'IT-EQ',
      description: 'Computers, laptops, monitors, accessories and networking devices.',
      isActive: true,
    },
  });

  const laptops = await prisma.assetCategory.upsert({
    where: { code: 'LAPTOP' },
    update: {},
    create: {
      name: 'Laptops',
      code: 'LAPTOP',
      description: 'Company issued laptops.',
      parentId: itEquipment.id,
      isActive: true,
    },
  });

  const monitors = await prisma.assetCategory.upsert({
    where: { code: 'MONITOR' },
    update: {},
    create: {
      name: 'Monitors',
      code: 'MONITOR',
      description: 'External displays.',
      parentId: itEquipment.id,
      isActive: true,
    },
  });

  const vehicles = await prisma.assetCategory.upsert({
    where: { code: 'VEHICLE' },
    update: {},
    create: {
      name: 'Vehicles',
      code: 'VEHICLE',
      description: 'Corporate transportation fleet.',
      isActive: true,
    },
  });

  const furniture = await prisma.assetCategory.upsert({
    where: { code: 'FURNITURE' },
    update: {},
    create: {
      name: 'Office Furniture',
      code: 'FURNITURE',
      description: 'Desks, chairs, and conference room setups.',
      isActive: true,
    },
  });

  console.log('Categories seeded.');
  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
