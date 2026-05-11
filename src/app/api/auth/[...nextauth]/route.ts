import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export async function GET(req: Request, { params }: { params: Promise<any> }) {
  const resolvedParams = await params;
  return handler(req, { params: resolvedParams } as any);
}

export async function POST(req: Request, { params }: { params: Promise<any> }) {
  const resolvedParams = await params;
  return handler(req, { params: resolvedParams } as any);
}
