import { PrismaClient, StaffRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Start seeding...");

  const defaultPassword = await bcrypt.hash("password123", 10);

  // 1. Create Departments
  const departments = [
    { code: "ADM", name: "Administration", description: "Hospital management and administration.", location: "2nd Floor, Main Building" },
    { code: "ER", name: "Emergency Room", description: "24/7 emergency medical services.", location: "1st Floor, South Wing" },
    { code: "LAB", name: "Laboratory", description: "Diagnostic and clinical testing services.", location: "1st Floor, North Wing" },
    { code: "PHAR", name: "Pharmacy", description: "Medication dispensing and inventory.", location: "1st Floor, Main Lobby" },
    { code: "BILL", name: "Billing & Finance", description: "Patient billing and PhilHealth processing.", location: "2nd Floor, Main Building" },
  ];

  const createdDepts = [];
  for (const dept of departments) {
    const d = await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
    createdDepts.push(d);
    console.log(`Upserted department: ${d.code}`);
  }

  const deptMap = Object.fromEntries(createdDepts.map(d => [d.code, d.id]));

  // 2. Create Seed Users & Staff
  const seedStaff = [
    {
      staffId: "STF-2024-00001",
      firstName: "System",
      lastName: "Admin",
      role: StaffRole.ADMIN,
      email: "admin@cliniq.com",
      deptCode: "ADM"
    },
    {
      staffId: "STF-2024-00002",
      firstName: "Ricardo",
      lastName: "Dalisay",
      role: StaffRole.DOCTOR,
      specialization: "Emergency Medicine",
      email: "doctor@cliniq.com",
      deptCode: "ER"
    },
    {
      staffId: "STF-2024-00003",
      firstName: "Maria",
      lastName: "Clara",
      role: StaffRole.NURSE,
      email: "nurse@cliniq.com",
      deptCode: "ER"
    },
    {
      staffId: "STF-2024-00004",
      firstName: "Juan",
      lastName: "Luna",
      role: StaffRole.BILLING,
      email: "billing@cliniq.com",
      deptCode: "BILL"
    },
    {
      staffId: "STF-2024-00005",
      firstName: "Jose",
      lastName: "Rizal",
      role: StaffRole.PHARMACY,
      email: "pharmacy@cliniq.com",
      deptCode: "PHAR"
    },
    {
      staffId: "STF-2024-00006",
      firstName: "Melchora",
      lastName: "Aquino",
      role: StaffRole.LABORATORY,
      email: "lab@cliniq.com",
      deptCode: "LAB"
    }
  ];

  for (const s of seedStaff) {
    const existingStaff = await prisma.staff.findUnique({
      where: { staffId: s.staffId }
    });

    if (!existingStaff) {
      const staff = await prisma.staff.create({
        data: {
          staffId: s.staffId,
          firstName: s.firstName,
          lastName: s.lastName,
          role: s.role,
          specialization: s.specialization,
          departmentId: deptMap[s.deptCode],
          user: {
            create: {
              email: s.email,
              password: defaultPassword,
              name: `${s.firstName} ${s.lastName}`,
              role: s.role,
            }
          }
        }
      });
      console.log(`Created staff & user: ${staff.firstName} ${staff.lastName} (${s.role})`);
    } else {
      console.log(`Staff ${s.staffId} already exists, skipping...`);
    }
  }

  // 3. Create Medications and Batches
  console.log("Seeding medications and batches...");
  const medications = [
    { code: "PAR-500", name: "Biogesic", genericName: "Paracetamol", form: "TABLET", strength: "500mg", unit: "pc", price: 5, stock: 150, reorderLevel: 50 },
    { code: "AMO-500", name: "Amoxicillin", genericName: "Amoxicillin", form: "CAPSULE", strength: "500mg", unit: "pc", price: 12, stock: 100, reorderLevel: 30 },
  ];

  for (const m of medications) {
    const med = await prisma.medication.upsert({
      where: { code: m.code },
      update: { stock: m.stock },
      create: m,
    });

    // Create a few batches for each medication to test FEFO
    const batch1Exp = new Date();
    batch1Exp.setMonth(batch1Exp.getMonth() + 3); // Expires in 3 months

    const batch2Exp = new Date();
    batch2Exp.setMonth(batch2Exp.getMonth() + 12); // Expires in 12 months

    await prisma.stockBatch.upsert({
      where: { id: `BATCH-${m.code}-001` },
      update: {},
      create: {
        id: `BATCH-${m.code}-001`,
        medicationId: med.id,
        batchNumber: `BN-${m.code}-001`,
        expiryDate: batch1Exp,
        initialQuantity: Math.floor(m.stock / 2),
        remainingQuantity: Math.floor(m.stock / 2),
        status: "ACTIVE"
      }
    });

    await prisma.stockBatch.upsert({
      where: { id: `BATCH-${m.code}-002` },
      update: {},
      create: {
        id: `BATCH-${m.code}-002`,
        medicationId: med.id,
        batchNumber: `BN-${m.code}-002`,
        expiryDate: batch2Exp,
        initialQuantity: m.stock - Math.floor(m.stock / 2),
        remainingQuantity: m.stock - Math.floor(m.stock / 2),
        status: "ACTIVE"
      }
    });

    console.log(`Upserted medication and batches for: ${m.name}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
