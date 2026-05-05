import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Departments
  const departments = [
    { name: "Emergency Room (ER)", description: "Acute care and emergency services" },
    { name: "Outpatient Department (OPD)", description: "Routine consultations and follow-ups" },
    { name: "Pharmacy", description: "Medication dispensing and inventory" },
    { name: "Laboratory", description: "Diagnostic testing and results" },
    { name: "Radiology", description: "X-ray, CT, MRI, and imaging" },
    { name: "Pediatrics", description: "Child healthcare" },
    { name: "Billing & Finance", description: "Revenue cycle management" },
    { name: "Administration", description: "Hospital management and operations" },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
  }

  // 2. Permissions
  const permissions = [
    { code: "can_view_patients", description: "View patient records" },
    { code: "can_register_patient", description: "Register new patients" },
    { code: "can_view_clinical_notes", description: "View EMR notes" },
    { code: "can_create_clinical_notes", description: "Create EMR notes" },
    { code: "can_prescribe", description: "Prescribe medications" },
    { code: "can_order_labs", description: "Order laboratory tests" },
    { code: "can_order_radiology", description: "Order imaging procedures" },
    { code: "can_view_billing", description: "View billing records" },
    { code: "can_create_charges", description: "Add charges to patients" },
    { code: "can_manage_users", description: "Administer staff and roles" },
    { code: "can_view_analytics", description: "View hospital metrics" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  // 3. Roles
  const roles = [
    {
      name: "SuperAdmin",
      description: "Full system access",
      permissions: ["can_manage_users", "can_view_analytics", "can_view_patients", "can_view_billing"],
    },
    {
      name: "Doctor",
      description: "Clinical practitioner",
      permissions: ["can_view_patients", "can_view_clinical_notes", "can_create_clinical_notes", "can_prescribe", "can_order_labs", "can_order_radiology"],
    },
    {
      name: "Nurse",
      description: "Nursing staff",
      permissions: ["can_view_patients", "can_view_clinical_notes", "can_create_clinical_notes", "can_order_labs"],
    },
    {
      name: "Pharmacist",
      description: "Pharmacy staff",
      permissions: ["can_view_patients"],
    },
    {
      name: "Billing Staff",
      description: "Revenue management",
      permissions: ["can_view_patients", "can_view_billing", "can_create_charges"],
    },
  ];

  for (const roleData of roles) {
    const permRecords = await prisma.permission.findMany({
      where: { code: { in: roleData.permissions } },
    });

    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        permissions: {
          set: permRecords.map(p => ({ id: p.id })),
        },
      },
      create: {
        name: roleData.name,
        description: roleData.description,
        permissions: {
          connect: permRecords.map(p => ({ id: p.id })),
        },
      },
    });
  }

  // 4. Initial SuperAdmin User
  const adminRole = await prisma.role.findUnique({ where: { name: "SuperAdmin" } });
  const adminDept = await prisma.department.findUnique({ where: { name: "Administration" } });

  if (adminRole && adminDept) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.upsert({
      where: { email: "admin@Cliniq.his" },
      update: {},
      create: {
        name: "System Administrator",
        email: "admin@Cliniq.his",
        passwordHash: hashedPassword,
        roleId: adminRole.id,
        primaryDepartmentId: adminDept.id,
        status: "ACTIVE",
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
