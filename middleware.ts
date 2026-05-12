import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// plan=none ガードをスキップするパスプレフィックス
const PLAN_GUARD_SKIP = [
  "/plans",
  "/credits",
  "/auth",
  "/lp",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/tokushoho",
  "/api",
  "/admin",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 認証不要パス（未ログインでもアクセス可）
  const publicPaths = ["/auth/", "/lp", "/terms", "/privacy", "/tokushoho"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    const res = NextResponse.next();
    res.headers.set("x-pathname", pathname);
    return res;
  }

  // Supabaseのセッションcookieが存在するかチェック
  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

  if (!hasSession) {
    // トップページは未ログイン時にLPへ誘導
    const dest = pathname === "/" ? "/lp" : "/auth/login";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // plan=none ガード（スキップ対象パスは除外）
  const isSkipped = PLAN_GUARD_SKIP.some((p) => pathname.startsWith(p));
  if (!isSkipped) {
    let response = NextResponse.next();

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
            });
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      if (!profile || profile.plan === "none") {
        return NextResponse.redirect(new URL("/plans", request.url));
      }
    }

    response.headers.set("x-pathname", pathname);
    return response;
  }

  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);
  return res;
}

// Webhookのパスを認証チェックから除外する
export const config = {
  matcher: [
    '/((?!api/stripe/webhook|_next/static|_next/image|favicon.ico).*)',
  ],
};
