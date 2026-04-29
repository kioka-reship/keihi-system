import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 認証不要パス
  if (pathname.startsWith("/auth/") || pathname === "/lp") {
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
