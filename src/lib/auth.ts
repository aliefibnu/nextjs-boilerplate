import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";

export async function getCurrentUser() {
  const cookie = await cookies();
  const token = cookie.get("access_token")?.value;
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  return payload?.email ?? null;
}
