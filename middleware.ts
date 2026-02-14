import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isDashboard = pathname.startsWith("/dashboard");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Logged-in: redirect auth pages and home to dashboard
  if (user) {
    if (isAuthRoute || pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  // Not logged-in: protect dashboard and redirect home to login
  if (pathname === "/" || isDashboard) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
