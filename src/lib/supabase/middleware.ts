import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAccessibleRoutes, type Role } from "@/lib/permissions";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicPath = pathname.startsWith("/login") || pathname.startsWith("/auth");

  // Redirect unauthenticated users to login
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // For authenticated users on protected routes, check is_active and role
  if (user && !isPublicPath) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    // Fail-closed: user tanpa profil yang valid tidak boleh lewat.
    // Tanpa baris profil, pemeriksaan is_active/role tidak bisa dipercaya.
    if (profileError || !profile) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Deactivated users get logged out
    if (profile.is_active === false) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Role-based route protection (fail-closed untuk role tak dikenal)
    const knownRoles: Role[] = ["admin", "manager", "sales"];
    const role = profile.role as Role;

    if (!knownRoles.includes(role)) {
      // Role tak dikenal tidak boleh mengakses rute apa pun. Sign-out, bukan
      // redirect ke /unauthorized — halaman itu juga terlindungi dan akan
      // menyebabkan redirect loop.
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const accessibleRoutes = getAccessibleRoutes(role);
    const isAccessible = accessibleRoutes.some((route) =>
      pathname === route || pathname.startsWith(route + "/")
    );

    if (!isAccessible) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
