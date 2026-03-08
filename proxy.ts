import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

const isSignInPage = createRouteMatcher(["/login", "/signup"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isProtectedApiRoute = createRouteMatcher(["/api(.*)"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();

  // Redirect authenticated users away from sign-in pages
  if (isSignInPage(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/");
  }

  // Redirect unauthenticated users to login for protected pages
  if (isProtectedRoute(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/login");
  }

  // Return 401 for unauthenticated API requests
  if (isProtectedApiRoute(request) && !isAuthenticated) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/dashboard", "/(api|trpc)(.*)"],
};
