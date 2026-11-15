import { NextResponse, type NextRequest } from "next/server";

// Быстрая проверка до рендера: без cookie сразу на вход с точным адресом
// возврата. Роль и валидность токена проверяют страницы (shared/session) и API.
export function proxy(request: NextRequest) {
  if (request.cookies.has("access_token")) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
