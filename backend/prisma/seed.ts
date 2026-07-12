import { PrismaClient, Role, AssetStatus, AssetCondition, BookingStatus, MaintenanceStatus } from '@prisma/client';
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

  // Clear existing data (in reverse order of dependencies)
  await prisma.auditVerification.deleteMany({});
  await prisma.auditAssignment.deleteMany({});
  await prisma.auditCycle.deleteMany({});
  await prisma.resourceBooking.deleteMany({});
  await prisma.maintenanceRequest.deleteMany({});
  await prisma.transferRequest.deleteMany({});
  await prisma.returnInspection.deleteMany({});
  await prisma.assetAllocation.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.assetCategory.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});

  console.log('Cleared existing database entries.');

  // 1. Seed Departments
  const it = await prisma.department.create({
    data: { name: 'Information Technology', code: 'IT', isActive: true },
  });

  const hr = await prisma.department.create({
    data: { name: 'Human Resources', code: 'HR', isActive: true },
  });

  const ops = await prisma.department.create({
    data: { name: 'Operations', code: 'OPS', isActive: true },
  });

  const logistics = await prisma.department.create({
    data: { name: 'Logistics', code: 'LOG', isActive: true },
  });

  console.log('Departments seeded.');

  // 2. Seed Locations
  const storA = await prisma.location.create({ data: { name: 'Storage Room A', code: 'STOR-A' } });
  const storB = await prisma.location.create({ data: { name: 'Storage Room B', code: 'STOR-B' } });
  const itFloor = await prisma.location.create({ data: { name: 'IT Floor', code: 'IT-FL' } });
  const hrDept = await prisma.location.create({ data: { name: 'HR Department', code: 'HR-DEPT' } });
  const opsFloor = await prisma.location.create({ data: { name: 'Operations Floor', code: 'OPS-FL' } });
  const srvRm = await prisma.location.create({ data: { name: 'Server Room', code: 'SRV-RM' } });
  const dataCtr = await prisma.location.create({ data: { name: 'Data Center', code: 'DATA-CTR' } });

  console.log('Locations seeded.');

  // 3. Seed Users
  const passwordHash = await bcrypt.hash('AdminPassword123!', 12);
  const empPasswordHash = await bcrypt.hash('EmployeePassword123!', 12);

  // Admin User
  const admin = await prisma.user.create({
    data: {
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

  // Department Heads / Managers / Employees
  const priya = await prisma.user.create({
    data: {
      employeeId: 'EMP-001',
      email: 'priya.shah@company.com',
      passwordHash: empPasswordHash,
      firstName: 'Priya',
      lastName: 'Shah',
      role: Role.EMPLOYEE,
      isActive: true,
      departmentId: it.id,
    },
  });

  const rahul = await prisma.user.create({
    data: {
      employeeId: 'EMP-002',
      email: 'rahul.mehta@company.com',
      passwordHash: empPasswordHash,
      firstName: 'Rahul',
      lastName: 'Mehta',
      role: Role.DEPARTMENT_HEAD,
      isActive: true,
      departmentId: it.id,
    },
  });

  const anjali = await prisma.user.create({
    data: {
      employeeId: 'EMP-003',
      email: 'anjali.verma@company.com',
      passwordHash: empPasswordHash,
      firstName: 'Anjali',
      lastName: 'Verma',
      role: Role.ASSET_MANAGER,
      isActive: true,
      departmentId: hr.id,
    },
  });

  const arjun = await prisma.user.create({
    data: {
      employeeId: 'EMP-004',
      email: 'arjun.mehta@company.com',
      passwordHash: empPasswordHash,
      firstName: 'Arjun',
      lastName: 'Mehta',
      role: Role.EMPLOYEE,
      isActive: true,
      departmentId: ops.id,
    },
  });

  const neha = await prisma.user.create({
    data: {
      employeeId: 'EMP-005',
      email: 'neha.kapoor@company.com',
      passwordHash: empPasswordHash,
      firstName: 'Neha',
      lastName: 'Kapoor',
      role: Role.EMPLOYEE,
      isActive: true,
      departmentId: hr.id,
    },
  });

  const raj = await prisma.user.create({
    data: {
      employeeId: 'EMP-006',
      email: 'raj.patel@company.com',
      passwordHash: empPasswordHash,
      firstName: 'Raj',
      lastName: 'Patel',
      role: Role.EMPLOYEE,
      isActive: true,
      departmentId: logistics.id,
    },
  });

  const simran = await prisma.user.create({
    data: {
      employeeId: 'EMP-007',
      email: 'simran.kaur@company.com',
      passwordHash: empPasswordHash,
      firstName: 'Simran',
      lastName: 'Kaur',
      role: Role.EMPLOYEE,
      isActive: true,
      departmentId: it.id,
    },
  });

  const vikram = await prisma.user.create({
    data: {
      employeeId: 'EMP-008',
      email: 'vikram.desai@company.com',
      passwordHash: empPasswordHash,
      firstName: 'Vikram',
      lastName: 'Desai',
      role: Role.EMPLOYEE,
      isActive: true,
      departmentId: ops.id,
    },
  });

  // Seed department head updates
  await prisma.department.update({ where: { id: it.id }, data: { headId: rahul.id } });
  await prisma.department.update({ where: { id: hr.id }, data: { headId: anjali.id } });

  console.log('Users and Department Heads seeded.');

  // 4. Seed Hierarchical Categories
  const itEquipment = await prisma.assetCategory.create({
    data: {
      name: 'IT Equipment',
      code: 'IT-EQ',
      description: 'Computers, laptops, monitors, accessories and networking devices.',
      isActive: true,
    },
  });

  const laptops = await prisma.assetCategory.create({
    data: {
      name: 'Laptops',
      code: 'LAPTOP',
      description: 'Company issued laptops.',
      parentId: itEquipment.id,
      isActive: true,
    },
  });

  const monitors = await prisma.assetCategory.create({
    data: {
      name: 'Monitors',
      code: 'MONITOR',
      description: 'External displays.',
      parentId: itEquipment.id,
      isActive: true,
    },
  });

  const projectCategory = await prisma.assetCategory.create({
    data: {
      name: 'Projectors',
      code: 'PROJECTOR',
      description: 'Meeting room projectors.',
      parentId: itEquipment.id,
      isActive: true,
    },
  });

  const vehicles = await prisma.assetCategory.create({
    data: {
      name: 'Vehicles',
      code: 'VEHICLE',
      description: 'Corporate transportation fleet.',
      isActive: true,
    },
  });

  const furniture = await prisma.assetCategory.create({
    data: {
      name: 'Office Furniture',
      code: 'FURNITURE',
      description: 'Desks, chairs, and conference room setups.',
      isActive: true,
    },
  });

  const rooms = await prisma.assetCategory.create({
    data: {
      name: 'Conference Rooms',
      code: 'ROOM',
      description: 'Shared company meeting spaces.',
      parentId: furniture.id,
      isActive: true,
    },
  });

  const labEquipment = await prisma.assetCategory.create({
    data: {
      name: 'Lab Equipment',
      code: 'LAB-EQ',
      description: 'Scientific and QA calibration gear.',
      isActive: true,
    },
  });

  console.log('Categories seeded.');

  // 5. Seed Assets
  // Assets list: laptops, monitors, projectors, rooms, vehicles, lab equipments
  const asset1 = await prisma.asset.create({
    data: {
      name: 'MacBook Pro 14"',
      assetTag: 'AF-0001',
      serialNumber: 'C02X1234HV2N',
      categoryId: laptops.id,
      locationId: itFloor.id,
      departmentId: it.id,
      status: AssetStatus.ALLOCATED,
      condition: AssetCondition.NEW,
      isBookable: true,
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      name: 'ThinkPad X1 Carbon',
      assetTag: 'AF-0002',
      serialNumber: 'PF2Y0089KL',
      categoryId: laptops.id,
      locationId: storA.id,
      departmentId: it.id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.GOOD,
      isBookable: true,
    },
  });

  const asset3 = await prisma.asset.create({
    data: {
      name: 'Dell UltraSharp 27"',
      assetTag: 'AF-0003',
      serialNumber: 'CN04Y6G7839DL',
      categoryId: monitors.id,
      locationId: itFloor.id,
      departmentId: it.id,
      status: AssetStatus.ALLOCATED,
      condition: AssetCondition.GOOD,
      isBookable: false,
    },
  });

  const asset4 = await prisma.asset.create({
    data: {
      name: 'Epson Projector EB-X51',
      assetTag: 'AF-0004',
      serialNumber: 'EPSXB451090',
      categoryId: projectCategory.id,
      locationId: storA.id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.GOOD,
      isBookable: true,
    },
  });

  const roomA = await prisma.asset.create({
    data: {
      name: 'Conference Room A',
      assetTag: 'AF-0005',
      categoryId: rooms.id,
      locationId: itFloor.id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.GOOD,
      isBookable: true,
    },
  });

  const roomB = await prisma.asset.create({
    data: {
      name: 'Conference Room B',
      assetTag: 'AF-0006',
      categoryId: rooms.id,
      locationId: itFloor.id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.GOOD,
      isBookable: true,
    },
  });

  const roomC = await prisma.asset.create({
    data: {
      name: 'Conference Room C',
      assetTag: 'AF-0007',
      categoryId: rooms.id,
      locationId: itFloor.id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.GOOD,
      isBookable: true,
    },
  });

  const vehicle01 = await prisma.asset.create({
    data: {
      name: 'Vehicle V-01',
      assetTag: 'AF-0008',
      serialNumber: 'MH-12-AB-1234',
      categoryId: vehicles.id,
      locationId: storB.id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.GOOD,
      isBookable: true,
    },
  });

  const labLE3 = await prisma.asset.create({
    data: {
      name: 'Lab Equipment LE-3',
      assetTag: 'AF-0009',
      serialNumber: 'LAB-LE3-981',
      categoryId: labEquipment.id,
      locationId: storB.id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.GOOD,
      isBookable: true,
    },
  });

  const asset10 = await prisma.asset.create({
    data: {
      name: 'Water Cooler Floor 3',
      assetTag: 'AF-0010',
      categoryId: furniture.id,
      locationId: opsFloor.id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.FAIR,
      isBookable: false,
    },
  });

  const asset11 = await prisma.asset.create({
    data: {
      name: 'iPhone 14 Pro Max',
      assetTag: 'AF-0011',
      serialNumber: 'IPH14P98231',
      categoryId: laptops.id,
      locationId: hrDept.id,
      departmentId: hr.id,
      status: AssetStatus.ALLOCATED,
      condition: AssetCondition.NEW,
      isBookable: false,
    },
  });

  const asset12 = await prisma.asset.create({
    data: {
      name: 'Office Chair — Ergonomic HNI',
      assetTag: 'AF-0012',
      serialNumber: 'OCH-ERGO-99',
      categoryId: furniture.id,
      locationId: opsFloor.id,
      departmentId: ops.id,
      status: AssetStatus.ALLOCATED,
      condition: AssetCondition.GOOD,
      isBookable: false,
    },
  });

  const asset13 = await prisma.asset.create({
    data: {
      name: 'Dell PowerEdge R740 Server',
      assetTag: 'AF-0013',
      serialNumber: 'SRV-PE-R740-01',
      categoryId: labEquipment.id,
      locationId: srvRm.id,
      departmentId: it.id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.NEW,
      isBookable: false,
    },
  });

  const asset14 = await prisma.asset.create({
    data: {
      name: 'Cisco Catalyst Switch 2960',
      assetTag: 'AF-0014',
      serialNumber: 'CIS-CAT-2960-99',
      categoryId: labEquipment.id,
      locationId: srvRm.id,
      departmentId: it.id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.GOOD,
      isBookable: false,
    },
  });

  const roomD = await prisma.asset.create({
    data: {
      name: 'Conference Room D (HQ)',
      assetTag: 'AF-0015',
      categoryId: rooms.id,
      locationId: hrDept.id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.GOOD,
      isBookable: true,
    },
  });

  const vehicle02 = await prisma.asset.create({
    data: {
      name: 'Vehicle V-02 (Corporate Van)',
      assetTag: 'AF-0016',
      serialNumber: 'MH-12-XYZ-9876',
      categoryId: vehicles.id,
      locationId: storB.id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.GOOD,
      isBookable: true,
    },
  });

  const asset17 = await prisma.asset.create({
    data: {
      name: 'Logitech MX Master 3S Mouse',
      assetTag: 'AF-0017',
      serialNumber: 'LOGI-MX3S-1234',
      categoryId: laptops.id,
      locationId: hrDept.id,
      departmentId: hr.id,
      status: AssetStatus.ALLOCATED,
      condition: AssetCondition.GOOD,
      isBookable: false,
    },
  });

  const asset18 = await prisma.asset.create({
    data: {
      name: 'Epson L3210 Printer',
      assetTag: 'AF-0018',
      serialNumber: 'EPS-L3210-PRINTER',
      categoryId: projectCategory.id,
      locationId: opsFloor.id,
      departmentId: ops.id,
      status: AssetStatus.AVAILABLE,
      condition: AssetCondition.GOOD,
      isBookable: false,
    },
  });

  console.log('Assets seeded.');

  // 6. Seed Asset Allocations
  await prisma.assetAllocation.create({
    data: {
      assetId: asset1.id,
      allocatedToId: priya.id,
      status: 'ACTIVE',
      allocationDate: new Date(),
    },
  });

  await prisma.assetAllocation.create({
    data: {
      assetId: asset3.id,
      allocatedToId: rahul.id,
      status: 'ACTIVE',
      allocationDate: new Date(),
    },
  });

  await prisma.assetAllocation.create({
    data: {
      assetId: asset11.id,
      allocatedToId: anjali.id,
      status: 'ACTIVE',
      allocationDate: new Date(),
    },
  });

  await prisma.assetAllocation.create({
    data: {
      assetId: asset12.id,
      allocatedToId: arjun.id,
      status: 'ACTIVE',
      allocationDate: new Date(),
    },
  });

  await prisma.assetAllocation.create({
    data: {
      assetId: asset17.id,
      allocatedToId: neha.id,
      status: 'ACTIVE',
      allocationDate: new Date(),
    },
  });

  console.log('Asset Allocations seeded.');

  // 7. Seed Bookings (Calculate current week dates dynamically)
  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const getWeekDate = (dayIndex: number, hour: number) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + dayIndex);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  // Conference Room A bookings
  await prisma.resourceBooking.create({
    data: {
      assetId: roomA.id,
      bookedById: priya.id,
      startTime: getWeekDate(0, 9), // Mon 9:00
      endTime: getWeekDate(0, 11), // Mon 11:00
      status: BookingStatus.UPCOMING,
    },
  });

  await prisma.resourceBooking.create({
    data: {
      assetId: roomA.id,
      bookedById: arjun.id,
      startTime: getWeekDate(2, 14), // Wed 14:00
      endTime: getWeekDate(2, 15), // Wed 15:00
      status: BookingStatus.UPCOMING,
    },
  });

  // Conference Room B bookings
  await prisma.resourceBooking.create({
    data: {
      assetId: roomB.id,
      bookedById: neha.id,
      startTime: getWeekDate(1, 10), // Tue 10:00
      endTime: getWeekDate(1, 12), // Tue 12:00
      status: BookingStatus.UPCOMING,
    },
  });

  await prisma.resourceBooking.create({
    data: {
      assetId: roomB.id,
      bookedById: vikram.id,
      startTime: getWeekDate(0, 14), // Mon 14:00
      endTime: getWeekDate(0, 16), // Mon 16:00
      status: BookingStatus.UPCOMING,
    },
  });

  // Conference Room C bookings
  await prisma.resourceBooking.create({
    data: {
      assetId: roomC.id,
      bookedById: raj.id,
      startTime: getWeekDate(3, 13), // Thu 13:00
      endTime: getWeekDate(3, 15), // Thu 15:00
      status: BookingStatus.UPCOMING,
    },
  });

  // Conference Room D bookings
  await prisma.resourceBooking.create({
    data: {
      assetId: roomD.id,
      bookedById: priya.id,
      startTime: getWeekDate(1, 15), // Tue 15:00
      endTime: getWeekDate(1, 17), // Tue 17:00
      status: BookingStatus.UPCOMING,
    },
  });

  // Vehicle bookings
  await prisma.resourceBooking.create({
    data: {
      assetId: vehicle01.id,
      bookedById: simran.id,
      startTime: getWeekDate(4, 8), // Fri 8:00
      endTime: getWeekDate(4, 12), // Fri 12:00
      status: BookingStatus.UPCOMING,
    },
  });

  await prisma.resourceBooking.create({
    data: {
      assetId: vehicle02.id,
      bookedById: anjali.id,
      startTime: getWeekDate(3, 9), // Thu 9:00
      endTime: getWeekDate(3, 12), // Thu 12:00
      status: BookingStatus.UPCOMING,
    },
  });

  // Lab Equipment bookings
  await prisma.resourceBooking.create({
    data: {
      assetId: labLE3.id,
      bookedById: simran.id,
      startTime: getWeekDate(2, 9), // Wed 9:00
      endTime: getWeekDate(2, 11), // Wed 11:00
      status: BookingStatus.UPCOMING,
    },
  });

  // Laptop bookings
  await prisma.resourceBooking.create({
    data: {
      assetId: asset1.id,
      bookedById: priya.id,
      startTime: getWeekDate(0, 9), // Mon 9:00
      endTime: getWeekDate(0, 11), // Mon 11:00
      status: BookingStatus.UPCOMING,
    },
  });

  await prisma.resourceBooking.create({
    data: {
      assetId: asset2.id,
      bookedById: arjun.id,
      startTime: getWeekDate(2, 13), // Wed 13:00
      endTime: getWeekDate(2, 16), // Wed 16:00
      status: BookingStatus.UPCOMING,
    },
  });

  console.log('Bookings seeded.');

  // 8. Seed Maintenance Requests
  await prisma.maintenanceRequest.create({
    data: {
      assetId: asset10.id,
      title: 'Water Cooler Leak',
      description: 'Slow water leak at the base of Floor 3 water cooler',
      status: MaintenanceStatus.TECHNICIAN_ASSIGNED,
      requestedById: simran.id,
      assignedToId: admin.id, // Assigned to admin for test
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      assetId: asset4.id,
      title: 'Projector Bulb Replace',
      description: 'Bulb dimming, replacement bulbs needed in Storage Room A',
      status: MaintenanceStatus.IN_PROGRESS,
      requestedById: arjun.id,
      assignedToId: rahul.id,
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      assetId: asset18.id,
      title: 'Printer Paper Jam',
      description: 'Repeated paper jam in tray 2 of the Epson printer',
      status: MaintenanceStatus.RAISED,
      requestedById: priya.id,
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      assetId: asset2.id,
      title: 'Laptop Battery Swelling',
      description: 'ThinkPad battery is expanding and chassis is bulging.',
      status: MaintenanceStatus.PENDING_APPROVAL,
      requestedById: raj.id,
    },
  });

  console.log('Maintenance Requests seeded.');

  // 8.5 Seed Transfer Requests
  await prisma.transferRequest.create({
    data: {
      assetId: asset1.id,
      targetDeptId: hr.id,
      requestedById: priya.id,
      status: 'REQUESTED',
    },
  });

  await prisma.transferRequest.create({
    data: {
      assetId: asset3.id,
      targetDeptId: ops.id,
      requestedById: rahul.id,
      status: 'DEPT_HEAD_APPROVED',
    },
  });

  console.log('Transfer Requests seeded.');

  // 9. Seed Audits
  // Seed Q2 Office IT Audit first (older cycle)
  const prevCycle = await prisma.auditCycle.create({
    data: {
      name: 'Q2 Office IT Audit',
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
      status: 'COMPLETED',
      isLocked: true,
    },
  });

  const prevAssign1 = await prisma.auditAssignment.create({
    data: {
      cycleId: prevCycle.id,
      auditorId: anjali.id,
      locationId: storA.id,
    },
  });

  const prevAssign2 = await prisma.auditAssignment.create({
    data: {
      cycleId: prevCycle.id,
      auditorId: rahul.id,
      departmentId: it.id,
    },
  });

  await prisma.auditVerification.create({
    data: {
      assignmentId: prevAssign1.id,
      assetId: asset4.id,
      status: 'VERIFIED',
      notes: 'Condition: Good',
    },
  });

  await prisma.auditVerification.create({
    data: {
      assignmentId: prevAssign2.id,
      assetId: asset3.id,
      status: 'VERIFIED',
      notes: 'Condition: Excellent',
    },
  });

  // Seed Q3 Hardware Inventory Audit second (newer active cycle)
  const cycle = await prisma.auditCycle.create({
    data: {
      name: 'Q3 Hardware Inventory Audit',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: 'IN_PROGRESS',
      isLocked: false,
    },
  });

  const assign1 = await prisma.auditAssignment.create({
    data: {
      cycleId: cycle.id,
      auditorId: anjali.id,
      locationId: storA.id,
    },
  });

  const assign2 = await prisma.auditAssignment.create({
    data: {
      cycleId: cycle.id,
      auditorId: rahul.id,
      departmentId: it.id,
    },
  });

  // Verification
  await prisma.auditVerification.create({
    data: {
      assignmentId: assign1.id,
      assetId: asset4.id, // Projector
      status: 'DAMAGED',
      notes: 'Bulb dimming and housing cracked.',
    },
  });

  console.log('Audit Cycles and Assignments seeded.');
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
