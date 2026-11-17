"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";

import { homePathFor } from "@/entities/user";
import { isRateLimited, useRateLimitCooldown } from "@/shared/api";
import { safeRedirectPath } from "@/shared/lib/redirect";
import { Button } from "@/shared/ui/button";
import { Field, Input } from "@/shared/ui/input";

import { useLogin } from "../api/use-login";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const cooldown = useRateLimitCooldown();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    login.mutate(
      {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      },
      {
        onSuccess: (user) => {
          const next = safeRedirectPath(
            searchParams.get("next"),
            homePathFor(user.role),
          );
          router.replace(next);
          // Серверные компоненты перечитают сессию из новой cookie.
          router.refresh();
        },
        onError: cooldown.startIfRateLimited,
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Почта" htmlFor="login-email">
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
        />
      </Field>
      <Field label="Пароль" htmlFor="login-password">
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      {cooldown.isCoolingDown ? (
        <p role="alert" className="text-sm text-destructive">
          Слишком много попыток входа. Попробуйте снова через{" "}
          {cooldown.secondsLeft} с.
        </p>
      ) : (
        // После отсчёта 429 уже не актуальна — форму можно отправить снова.
        login.error &&
        !isRateLimited(login.error) && (
          <p role="alert" className="text-sm text-destructive">
            {login.error.message}
          </p>
        )
      )}

      <Button
        type="submit"
        size="lg"
        className="min-h-11"
        disabled={login.isPending || cooldown.isCoolingDown}
      >
        {login.isPending
          ? "Входим…"
          : cooldown.isCoolingDown
            ? `Подождите ${cooldown.secondsLeft} с`
            : "Войти"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-copper hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
