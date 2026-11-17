"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  passwordProblem,
  passwordRules,
} from "@/entities/user";
import { isRateLimited, useRateLimitCooldown } from "@/shared/api";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Field, Input } from "@/shared/ui/input";

import { useRegister } from "../api/use-register";

const MISMATCH_MESSAGE = "Пароли не совпадают";

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();
  const cooldown = useRateLimitCooldown();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  // Несовпадение показываем после ухода из поля или попытки отправить, а не с первого символа.
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const mismatch = confirmTouched && confirm !== password;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmTouched(true);
    const problem = passwordProblem(password);
    setPasswordError(problem);
    if (problem || confirm !== password) return;

    const form = new FormData(event.currentTarget);
    register.mutate(
      {
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password,
      },
      {
        onSuccess: () => {
          router.replace("/account");
          router.refresh();
        },
        onError: cooldown.startIfRateLimited,
      },
    );
  }

  const formError =
    passwordError ??
    (register.error && !isRateLimited(register.error)
      ? register.error.message
      : null);

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
      <Field label="Пароль" htmlFor="register-password">
        <Input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setPasswordError(null);
          }}
          aria-describedby="register-password-rules"
          aria-invalid={passwordError !== null}
        />
        <ul
          id="register-password-rules"
          className="flex flex-col gap-1 text-sm"
          aria-label="Требования к паролю"
        >
          {passwordRules.map((rule) => {
            const ok = rule.test(password);
            return (
              <li
                key={rule.id}
                className={cn(
                  "flex items-center gap-2",
                  ok ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span aria-hidden className={cn("w-4", ok && "text-copper")}>
                  {ok ? "✓" : "•"}
                </span>
                {rule.label}
                <span className="sr-only">
                  {ok ? " — выполнено" : " — не выполнено"}
                </span>
              </li>
            );
          })}
        </ul>
      </Field>
      <Field label="Повторите пароль" htmlFor="register-password-confirm">
        <Input
          id="register-password-confirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          required
          maxLength={PASSWORD_MAX_LENGTH}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          onBlur={() => setConfirmTouched(confirm !== "")}
          aria-invalid={mismatch}
          aria-describedby={
            mismatch ? "register-password-confirm-error" : undefined
          }
        />
        {mismatch && (
          <p
            id="register-password-confirm-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {MISMATCH_MESSAGE}
          </p>
        )}
      </Field>

      {cooldown.isCoolingDown ? (
        <p role="alert" className="text-sm text-destructive">
          Слишком много попыток. Попробуйте снова через {cooldown.secondsLeft}{" "}
          с.
        </p>
      ) : (
        formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )
      )}

      <Button
        type="submit"
        size="lg"
        className="min-h-11"
        disabled={register.isPending || cooldown.isCoolingDown}
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
