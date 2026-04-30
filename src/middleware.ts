import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const { pathname } = request.nextUrl;

  if (
    user &&
    (pathname === "/" ||
      pathname.startsWith("/sign-in") ||
      pathname.startsWith("/sign-up") ||
      pathname.startsWith("/forgot-password"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    !user &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/settings"))
  ) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/settings/:path*",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
  ],
};
