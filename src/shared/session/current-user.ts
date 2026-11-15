import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { http, unwrap, type ApiSchemas } from "@/shared/api";

export type SessionUser = ApiSchemas["UserDto"];
type Role = SessionUser["role"];

// Имя cookie задаёт бэкенд (auth-cookie.ts); браузер шлёт её и на сайт, и на API.
const ACCESS_TOKEN_COOKIE = "access_token";

// Cookie текущего запроса для серверных вызовов API от имени пользователя.
export async function sessionHeaders(): Promise<Record<string, string>> {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  return token ? { cookie: `${ACCESS_TOKEN_COOKIE}=${token}` } : {};
}

// Один запрос к /auth/me на рендер, сколько бы компонентов ни спросили.
// Только внутри <Suspense>: cookies() с cacheComponents — динамика.
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const headers = await sessionHeaders();
  if (!headers.cookie) return null;

  const result = await http.GET("/api/auth/me", { headers });
  if (result.response.status === 401) return null;
  return unwrap(result);
});

type RequireUserOptions = {
  // Адрес страницы — чтобы вернуть на неё после входа.
  from: string;
  roles?: readonly Role[];
};

// Нет входа — на /login; не та роль — клиента на главную, сотрудника в панель.
export async function requireUser({
  from,
  roles,
}: RequireUserOptions): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(from)}`);
  }
  if (roles && !roles.includes(user.role)) {
    redirect(user.role === "client" ? "/" : "/admin");
  }
  return user;
}
