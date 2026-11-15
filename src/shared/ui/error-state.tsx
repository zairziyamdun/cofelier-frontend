"use client";

import { Button } from "./button";

type ErrorStateProps = {
  title: string;
  description?: string;
  onRetry?: () => void;
};

// Состояние ошибки экрана: текст и повтор. Для error.tsx — onRetry = retry.
export function ErrorState({
  title,
  description = "Проверьте соединение и попробуйте ещё раз.",
  onRetry,
}: ErrorStateProps) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="font-heading text-3xl">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      {onRetry && (
        <Button size="lg" className="min-h-11 px-6" onClick={() => onRetry()}>
          Попробовать снова
        </Button>
      )}
    </main>
  );
}
