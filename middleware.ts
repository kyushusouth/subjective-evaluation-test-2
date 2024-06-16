import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createClient } from "@/utils/supabase/server";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;

  console.log(`Middleware called for path: ${pathname}`);

  // セッションを常に更新
  const session = await updateSession(request);
  console.log("Session updated:", session);

  if (pathname.startsWith("/login") || pathname.startsWith("/api")) {
    console.log("Skipping middleware for login or API paths");
    return NextResponse.next();
  }

  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting user:", error);
  }

  if (!user) {
    console.log("User not found, redirecting to /login");
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return session;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
