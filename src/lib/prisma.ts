import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not defined in environment variables!");
} else {
  console.log("Prisma initialized with connection string (masked):", connectionString.replace(/:[^:@]+@/, ":****@"));
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Check if existing global prisma has the new models and relations
let prisma = globalThis.prisma;
if (prisma) {
  const isStale = 
    !("staff" in prisma) || 
    !("department" in prisma) || 
    // Check if the Staff model has the 'user' relation available
    (prisma as any).staff?.fields?.user === undefined && (prisma as any)._base?.models?.Staff?.fields?.user === undefined;

  if (isStale) {
    console.log("Global Prisma instance is stale or missing relations. Re-initializing...");
    prisma = undefined;
  }
}

if (!prisma) {
  prisma = prismaClientSingleton();
}

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
