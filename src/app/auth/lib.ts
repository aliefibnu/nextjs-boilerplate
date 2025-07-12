"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { createSession, deleteSession, verifyAccessToken } from "@/lib/jwt";
import { cookies } from "next/headers";

const schema = z.object({
  email: z.string().email().trim(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export async function signup(prevState: any, formData: FormData) {
  const data = schema.safeParse(Object.fromEntries(formData));
  if (!data.success) return { errors: data.error.flatten().fieldErrors };

  const { email, password, name } = data.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) return { errors: { email: ["Email already taken"] } };

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, password: hash, name: name ?? "" },
  });

  await createSession(email);
  return { success: true };
}

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { errors: { email: ["Invalid credentials"] } };

  const match = await bcrypt.compare(password, user.password);
  if (!match) return { errors: { password: ["Wrong password"] } };

  await createSession(email);
  return { success: true };
}

export async function updateName(formData: FormData) {
  const name = formData.get("name")?.toString();
  if (!name) return { error: "Name is required" };

  const token = (await cookies()).get("access_token")?.value;
  if (!token) return { error: "Not authenticated" };

  const session = await verifyAccessToken(token);
  if (!session?.email) return { error: "Invalid token" };

  const user = await prisma.user.update({
    where: { email: session.email },
    data: { name },
  });

  return { success: true, name: user.name };
}

export async function logout() {
  try {
    await deleteSession();
    return { success: true };
  } catch (error) {
    return { error };
  }
}
