"use client";

import { LogIn, RotateCw, UserRound } from "lucide-react";
import Link from "next/link";

import { homePathFor, useCurrentUser } from "@/entities/user";
import { cn } from "@/shared/lib/utils";

const buttonClass =
  "flex size-11 items-center justify-center gap-2 rounded-lg hover:bg-muted md:w-auto md:px-4";

// На телефоне — только иконка (в шапке мало места), с md — иконка и текст.
export function UserButton() {
  const {
    data: user,
    isPending,
    unavailable,
    isFetching,
    refetch,
  } = useCurrentUser();

  if (isPending) return <UserButtonPlaceholder />;

  // Сервер не ответил: «Войти» здесь соврал бы вошедшему человеку.
  if (unavailable) {
    return (
      <button
        type="button"
        onClick={() => void refetch()}
        disabled={isFetching}
        className={cn(buttonClass, "text-muted-foreground")}
        aria-label="Не удалось проверить вход. Повторить"
        title="Не удалось проверить вход"
      >
        <RotateCw
          aria-hidden="true"
          className={cn("size-5", isFetching && "animate-spin")}
        />
        <span className="hidden font-medium md:inline">Повторить</span>
      </button>
    );
  }

  if (!user) {
    return (
      <Link href="/login" className={buttonClass} aria-label="Войти">
        <LogIn aria-hidden="true" className="size-5" />
        <span className="hidden font-medium md:inline">Войти</span>
      </Link>
    );
  }

  return (
    <Link
      href={homePathFor(user.role)}
      className={buttonClass}
      aria-label={`Профиль: ${user.name}`}
    >
      <UserRound aria-hidden="true" className="size-5 text-copper" />
      <span className="hidden max-w-32 truncate font-medium md:inline">
        {user.name}
      </span>
    </Link>
  );
}

export function UserButtonPlaceholder() {
  return <span aria-hidden="true" className="block size-11 md:w-24" />;
}
