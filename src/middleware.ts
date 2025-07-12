import { NextRequest, NextResponse } from "next/server";
import {
  verifyAccessToken,
  verifyRefreshToken,
  createAccessToken,
} from "./lib/jwt";
import { JWTPayload } from "jose";
import { localConfig } from "./lib/localConfig";

// ✅ Aktifkan atau nonaktifkan log debug di sini
let { DEBUG_MODE } = localConfig;

function log(...args: any[]) {
  if (DEBUG_MODE) console.debug(...args);
}

export const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/account",
];
export const guestRoutes = ["/auth/login", "/auth/signup"];
export const publicRoutes = ["/", "/about", "/contact"];

function matchRoute(path: string, routes: string[]) {
  return routes.some((route) => path.startsWith(route));
}

async function tryDecode(
  token: string
): Promise<JWTPayload | null | "EXPIRED"> {
  try {
    const payload = await verifyAccessToken(token);
    log("[MIDDLEWARE] (accessToken valid).payload:", payload);
    return payload;
  } catch (err: any) {
    if (err.code === "ERR_JWT_EXPIRED") {
      log("[MIDDLEWARE] (accessToken expired)");
      return "EXPIRED";
    }
    log("[MIDDLEWARE] (accessToken invalid)", err);
    return null;
  }
}

function clearSessionAndLogout(url: string) {
  const res = NextResponse.redirect(new URL("/auth/login", url));
  res.cookies.set("access_token", "", { maxAge: 0, path: "/" });
  res.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
  log("[MIDDLEWARE] clearSessionAndLogout -> redirect to /auth/login");
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const refreshToken = req.cookies.get("refresh_token")?.value;
  let accessToken = req.cookies.get("access_token")?.value;

  let userEmail: string | null = null;
  let shouldRefreshAccessToken = false;
  let res = NextResponse.next();

  log("[MIDDLEWARE] request.path:", pathname);
  log(
    "[MIDDLEWARE] cookies -> accessToken exists:",
    !!accessToken,
    "| refreshToken exists:",
    !!refreshToken
  );

  // ⛔️ SKIP VALIDASI JIKA PATH GUEST
  if (matchRoute(pathname, guestRoutes)) {
    log("[MIDDLEWARE] route GUEST -> skip validation");
    return res;
  }

  const accessResult = accessToken ? await tryDecode(accessToken) : null;

  if (accessResult === "EXPIRED" || (!accessToken && refreshToken)) {
    log("[MIDDLEWARE] (refreshToken exists || accessToken expired)");

    if (typeof refreshToken === "string") {
      const refreshPayload = await verifyRefreshToken(refreshToken);
      if (refreshPayload) {
        accessToken = await createAccessToken({ email: refreshPayload.email });
        userEmail = refreshPayload.email;
        shouldRefreshAccessToken = true;
        log("[MIDDLEWARE] refreshPayload:", refreshPayload);
      } else {
        log("[MIDDLEWARE] refreshToken INVALID. Logging out.");
        return clearSessionAndLogout(req.url);
      }
    } else {
      log("[MIDDLEWARE] refreshToken MISSING. Logging out.");
      return clearSessionAndLogout(req.url);
    }
  } else if (accessResult === null) {
    log("[MIDDLEWARE] accessToken INVALID. Logging out.");
    return clearSessionAndLogout(req.url);
  } else if (accessResult) {
    userEmail = accessResult.email as string;
    log("[MIDDLEWARE] accessToken OK. userEmail:", userEmail);
  }

  if (matchRoute(pathname, protectedRoutes)) {
    if (!userEmail) {
      log("[MIDDLEWARE] route PROTECTED but not authenticated. Logging out.");
      return clearSessionAndLogout(req.url);
    }
  }

  if (shouldRefreshAccessToken && userEmail && accessToken) {
    res.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: !DEBUG_MODE,
      maxAge: 60 * 15,
      path: "/",
    });
    log("[MIDDLEWARE] accessToken refreshed and set to cookie.");
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
