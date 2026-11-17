"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiError } from "./http";

// Бэкенд отдаёт Retry-After; если заголовка нет — окно лимита целиком.
const FALLBACK_SECONDS = 60;

// Отсчёт после 429: форма блокирует отправку, пока лимит не истечёт.
export function useRateLimitCooldown() {
  const [until, setUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (until === null) return;
    const timer = setInterval(() => {
      const left = Math.ceil((until - Date.now()) / 1000);
      setSecondsLeft(Math.max(left, 0));
      if (left <= 0) setUntil(null);
    }, 1000);
    return () => clearInterval(timer);
  }, [until]);

  // true — ошибка была 429 и отсчёт запущен.
  const startIfRateLimited = useCallback((error: unknown) => {
    if (!(error instanceof ApiError) || error.status !== 429) return false;
    const seconds = error.retryAfterSeconds ?? FALLBACK_SECONDS;
    setUntil(Date.now() + seconds * 1000);
    setSecondsLeft(seconds);
    return true;
  }, []);

  return { secondsLeft, isCoolingDown: secondsLeft > 0, startIfRateLimited };
}

export function isRateLimited(error: unknown): boolean {
  return error instanceof ApiError && error.status === 429;
}
