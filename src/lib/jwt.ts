import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { localConfig, logDebug } from "@/lib/localConfig";

const { DEBUG_MODE, JWT_SECRET: secret } = localConfig;

const key = new TextEncoder().encode(secret);

type TokenPayload = {
  email: string;
};

const createJWT = async (payload: TokenPayload, exp: string) => {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(key);

  logDebug("[JWT] Token created with expiration:", exp, "payload:", payload);
  return token;
};

export const createAccessToken = (payload: TokenPayload) => {
  logDebug("[JWT] Creating Access Token...");
  return createJWT(payload, "15m");
};

export const createRefreshToken = (payload: TokenPayload) => {
  logDebug("[JWT] Creating Refresh Token...");
  return createJWT(payload, "7d");
};

export const verifyAccessToken = async (token: string) => {
  logDebug("[JWT] Verifying Access Token...");
  try {
    const { payload } = await jwtVerify(token, key);
    logDebug("[JWT] Access Token valid. Payload:", payload);
    return payload as TokenPayload;
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      logDebug("[JWT] Access Token expired.");
      return "EXPIRED" as unknown as TokenPayload;
    }
    logDebug("[JWT] Access Token invalid:", error.message);
    return null;
  }
};

export const verifyRefreshToken = async (token: string) => {
  logDebug("[JWT] Verifying Refresh Token...");
  try {
    const { payload } = await jwtVerify(token, key);
    logDebug("[JWT] Refresh Token valid. Payload:", payload);
    return payload as TokenPayload;
  } catch (error: any) {
    logDebug("[JWT] Refresh Token invalid:", error.message);
    return null;
  }
};

export async function createSession(email: string) {
  logDebug("[JWT] Creating session for:", email);
  const cookie = await cookies();

  const access = await createAccessToken({ email });
  const refresh = await createRefreshToken({ email });

  cookie.set("access_token", access, {
    httpOnly: true,
    secure: !DEBUG_MODE,
    maxAge: 60 * 15, // 15 minutes
    path: "/",
  });

  cookie.set("refresh_token", refresh, {
    httpOnly: true,
    secure: !DEBUG_MODE,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  logDebug("[JWT] Session cookies set: access_token & refresh_token");
}

export async function deleteSession() {
  logDebug("[JWT] Deleting session cookies...");
  const cookie = await cookies();
  cookie.delete("access_token");
  cookie.delete("refresh_token");
  logDebug("[JWT] Session cookies deleted.");
}
