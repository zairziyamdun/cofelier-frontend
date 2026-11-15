import { Suspense } from "react";

import { LoginForm } from "@/features/auth/login";

import { AuthCard } from "./AuthCard";

export function LoginPage() {
  return (
    <AuthCard title="Вход" description="Для клиентов и сотрудников Cofelier.">
      {/* Форма читает ?next= из адреса — с cacheComponents это только под Suspense. */}
      <Suspense fallback={<div className="h-72" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
