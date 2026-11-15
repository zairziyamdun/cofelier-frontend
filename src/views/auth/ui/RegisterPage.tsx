import { RegisterForm } from "@/features/auth/register";

import { AuthCard } from "./AuthCard";

export function RegisterPage() {
  return (
    <AuthCard
      title="Регистрация"
      description="Аккаунт нужен, чтобы оформлять предзаказы и видеть их историю."
    >
      <RegisterForm />
    </AuthCard>
  );
}
