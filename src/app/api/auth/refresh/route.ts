import { cookies } from "next/headers";
import { createAccessToken, verifyRefreshToken } from "@/lib/jwt";

export async function GET() {
  const cookie = await cookies();
  const refresh = cookie.get("refresh_token")?.value;
  if (!refresh) return new Response("No refresh token", { status: 401 });

  const payload = await verifyRefreshToken(refresh);
  if (!payload) return new Response("Invalid refresh token", { status: 401 });

  const access = await createAccessToken({ email: payload.email });
  cookie.set("access_token", access, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 15,
    path: "/",
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
