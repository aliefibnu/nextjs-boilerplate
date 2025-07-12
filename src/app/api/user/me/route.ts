import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookie = await cookies();
  const session = cookie.get("access_token")?.value;
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await verifyAccessToken(session);
  if (!data?.email)
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    email: user.email,
    name: user.name,
    role: user.role,
  });
}
