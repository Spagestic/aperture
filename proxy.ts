import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

const isSignInPage = createRouteMatcher(["/login", "/signup"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isProtectedApiRoute = createRouteMatcher(["/api(.*)"]);
// Temporarily
const isPublicApiRoute = createRouteMatcher([
  "/api/fmp(.*)",
  "/api/finnhub(.*)",
  "/api/yahoo(.*)",
  "/api/company-financials(.*)",
]);

export const proxy = convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const isAuthenticated = await convexAuth.isAuthenticated();

    if (isSignInPage(request) && isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/");
    }

    if (isProtectedRoute(request) && !isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/login");
    }

    // Return 401 for unauthenticated API requests
    if (
      isProtectedApiRoute(request) &&
      !isPublicApiRoute(request) &&
      !isAuthenticated
    ) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
  },
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/dashboard", "/(api|trpc)(.*)"],
};
