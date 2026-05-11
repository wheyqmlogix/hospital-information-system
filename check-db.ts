import prisma from "./src/lib/prisma";

async function main() {
  const depts = await prisma.department.count();
  const staff = await prisma.staff.count();
  const users = await prisma.user.count();
  
  console.log({
    departments: depts,
    staff: staff,
    users: users
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
