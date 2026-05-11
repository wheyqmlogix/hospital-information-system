import prisma from "./src/lib/prisma";

async function main() {
  console.log("Prisma keys:", Object.keys(prisma).filter(k => !k.startsWith("_")));
  
  try {
    const staffCount = await prisma.staff.count();
    console.log("Staff count:", staffCount);
  } catch (e) {
    console.error("Staff access failed:", e.message);
  }

  try {
    const deptCount = await prisma.department.count();
    console.log("Dept count:", deptCount);
  } catch (e) {
    console.error("Dept access failed:", e.message);
  }
}

main().finally(() => prisma.$disconnect());
