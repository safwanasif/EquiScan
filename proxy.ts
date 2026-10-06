import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Supabase can return provider errors to the Site URL before our callback runs.
  // Keep provider-supplied descriptions out of the UI and use a fixed destination.
  if (request.nextUrl.pathname === "/" &&
      (request.nextUrl.searchParams.has("error") || request.nextUrl.searchParams.has("error_code"))) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }
  // The prepared sample must remain available without authentication services.
  if (["/demo", "/evaluation"].includes(request.nextUrl.pathname) || request.nextUrl.pathname.startsWith("/samples/")) return NextResponse.next();
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
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // CRITICAL: This call refreshes the session and sets cookies on the response
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
