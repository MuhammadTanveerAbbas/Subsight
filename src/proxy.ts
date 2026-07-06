import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
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
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const emailVerified = !!user?.email_confirmed_at;

  const isProtectedApp =
    pathname.startsWith("/dashboard") || pathname.startsWith("/settings");
  const isVerifyPage = pathname.startsWith("/verify-email");
  const isAuthCallback = pathname.startsWith("/auth/callback");

  const isAuthPage =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/auth/signin") ||
    pathname.startsWith("/auth/signup") ||
    pathname.startsWith("/auth/forgot-password") ||
    pathname.startsWith("/auth/reset-password") ||
    isAuthCallback;

  if (!user) {
    if (isProtectedApp || isVerifyPage) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return supabaseResponse;
  }

  if (!emailVerified && isProtectedApp) {
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }

  if (
    emailVerified &&
    (isVerifyPage || pathname === "/" || (isAuthPage && !isAuthCallback))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/settings/:path*",
    "/verify-email",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/auth/:path*",
  ],
};
