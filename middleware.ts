import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 認証不要パス
  if (pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  // Supabaseのセッションcookieが存在するかチェック
  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

  if (!hasSession) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

// Webhookのパスを認証チェックから除外する
export const config = {
  matcher: [
    '/((?!api/stripe/webhook|_next/static|_next/image|favicon.ico).*)',
  ],
};
