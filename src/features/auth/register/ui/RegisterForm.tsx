"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

import { Button } from "@/shared/ui/button";
import { Field, Input } from "@/shared/ui/input";

import { useRegister } from "../api/use-register";

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    register.mutate(
      {
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      },
      {
        onSuccess: () => {
          router.replace("/account");
          router.refresh();
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Имя" htmlFor="register-name">
        <Input
          id="register-name"
          name="name"
          autoComplete="given-name"
          required
          minLength={2}
          maxLength={60}
        />
      </Field>
      <Field label="Почта" htmlFor="register-email">
        <Input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
        />
      </Field>
      <Field
        label="Пароль"
        htmlFor="register-password"
        hint="Не короче 8 символов"
      >
        <Input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </Field>

      {register.error && (
        <p role="alert" className="text-sm text-destructive">
          {register.error.message}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        className="min-h-11"
        disabled={register.isPending}
      >
        {register.isPending ? "Создаём аккаунт…" : "Зарегистрироваться"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-copper hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}
