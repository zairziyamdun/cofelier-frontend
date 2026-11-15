"use client";

import { LogIn, UserRound } from "lucide-react";
import Link from "next/link";

import { homePathFor, useCurrentUser } from "@/entities/user";

const buttonClass =
  "flex size-11 items-center justify-center gap-2 rounded-lg hover:bg-muted md:w-auto md:px-4";

// На телефоне — только иконка (в шапке мало места), с md — иконка и текст.
export function UserButton() {
  const { data: user, isPending } = useCurrentUser();

  if (isPending) return <UserButtonPlaceholder />;

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
