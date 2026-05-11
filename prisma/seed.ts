import { PrismaClient, StaffRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Start seeding...");

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
              password: "password123", // Default password
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
